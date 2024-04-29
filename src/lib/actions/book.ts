'use server';

import logger from '@/lib/logger';
import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import BookCreateInput from '@/types/BookCreateInput';
import BookHydrated from '@/types/BookHydrated';
import { Book, Prisma, ProductType } from '@prisma/client';
import { serializeBookSource } from '@/lib/serializers/book-source';

export async function buildAuthorsInput(
  tx: Prisma.TransactionClient,
  authors: string,
): Promise<Prisma.AuthorCreateNestedManyWithoutBooksInput> {
  const authorStrings = authors.split(',').map((a) => a.trim());
  const authorsConnectInput: Prisma.AuthorWhereUniqueInput[] = [];
  const authorsCreateInput: Prisma.AuthorCreateWithoutBooksInput[] = [];

  await Promise.all(
    authorStrings.map(async (authorString) => {
      const author = await tx.author.findFirst({
        where: { name: authorString },
      });

      if (author) {
        authorsConnectInput.push({
          id: author.id,
        });
      } else {
        authorsCreateInput.push({
          name: authorString,
        });
      }
    }),
  );
  const authorsInput: Prisma.AuthorCreateNestedManyWithoutBooksInput = {
    connect: authorsConnectInput,
    create: authorsCreateInput,
  };

  return authorsInput;
}

export async function buildPublisherInput(
  tx: Prisma.TransactionClient,
  publisherString: string,
): Promise<Prisma.BookSourceCreateNestedOneWithoutBooksInput> {
  const publisher = await tx.bookSource.findFirst({
    where: { name: publisherString },
  });

  if (publisher) {
    return {
      connect: {
        id: publisher.id,
      },
    };
  } else {
    return {
      create: {
        isPublisher: true,
        // TODO we need better logic to determine if vendor
        isVendor: false,
        name: publisherString,
      },
    };
  }
}

async function buildCreateUpdateBookData(
  tx: Prisma.TransactionClient,
  book: BookCreateInput,
): Promise<Prisma.BookCreateInput | Prisma.BookUpdateInput> {
  const authors = await buildAuthorsInput(tx, book.authors);

  const publisher = await buildPublisherInput(tx, book.publisher);

  return {
    authors,
    format: { connect: { id: book.formatId } },
    genre: { connect: { id: book.genreId } },
    imageUrl: book.imageUrl,
    isbn13: book.isbn13,
    priceInCents: book.priceInCents,
    publishedDate: book.publishedDate,
    publisher,
    quantity: book.quantity,
    title: book.title,
  };
}

export async function upsertBook({
  book,
  tx,
}: {
  book: BookCreateInput;
  tx: Prisma.TransactionClient;
}): Promise<BookHydrated> {
  // when we create a book, we create authors and publisher if they do not exist
  // so this entire operation needs to be executed in a serial transaction
  logger.trace('upsertBook, book: %j', book);

  const data = await buildCreateUpdateBookData(tx, book);

  const upsertedBook = await tx.book.upsert({
    create: data as Prisma.BookCreateInput,
    include: {
      authors: true,
      format: true,
      genre: true,
      publisher: true,
    },
    update: data as Prisma.BookUpdateInput,
    where: { isbn13: book.isbn13 },
  });

  logger.trace('upsertedBook in DB: %j', upsertedBook);

  return {
    ...upsertedBook,
    publisher: serializeBookSource(upsertedBook.publisher),
  };
}

/**
 * Reduces all book updates by book ID
 */
export async function reduceBookUpdates(
  items: Array<{
    bookId: number | null;
    productType: ProductType;
    quantity: number;
  }>,
): Promise<
  Array<{ decreasedQuantity: number; id: number; increasedQuantity: number }>
> {
  return items.reduce(
    (acc, item) => {
      if (item.productType !== ProductType.BOOK || item.bookId === null) {
        logger.warn(
          'non-book product type encountered, skipping invoice item: %j',
          item,
        );
        return acc;
      }

      const match = acc.find((i) => i.id === item.bookId);
      if (match) {
        match.decreasedQuantity -= item.quantity;
        match.increasedQuantity += item.quantity;
      } else {
        acc.push({
          decreasedQuantity: -item.quantity,
          id: item.bookId,
          increasedQuantity: item.quantity,
        });
      }
      return acc;
    },
    [] as Array<{
      decreasedQuantity: number;
      id: number;
      increasedQuantity: number;
    }>,
  );
}

/**
 * Updates the quantity for a Book by the quantityChange.
 */
export async function updateBookQuantity({
  bookId,
  quantityChange,
  tx,
}: {
  bookId: number;
  quantityChange: number;
  tx: Prisma.TransactionClient;
}): Promise<void> {
  const book = await tx.book.findUniqueOrThrow({
    where: { id: bookId },
  });

  const updatedQuantity = book.quantity + quantityChange;
  logger.trace(
    'book.id: %s book.quantity: %d quantityChange: %d updatedQuantity %d',
    book.id,
    book.quantity,
    quantityChange,
    updatedQuantity,
  );

  await tx.book.update({
    data: { quantity: updatedQuantity },
    where: { id: bookId },
  });
}

export interface GetBooksParams {
  paginationQuery?: PaginationQuery;
}

export interface GetBooksResult {
  books: Array<BookHydrated>;
  pageInfo: PageInfo;
}

export async function getBooks({
  paginationQuery,
}: GetBooksParams): Promise<GetBooksResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const rawItems = await prisma.book.findMany({
    ...paginationRequest,
    include: {
      authors: true,
      format: true,
      genre: true,
      publisher: true,
    },
  });

  const items = rawItems.map((item) => ({
    ...item,
    publisher: serializeBookSource(item.publisher),
  }));

  const { items: books, pageInfo } = buildPaginationResponse<BookHydrated>({
    items,
    paginationQuery,
  });

  return {
    books,
    pageInfo,
  };
}

export async function getBook(
  isbn13: Book['isbn13'],
): Promise<BookHydrated | null> {
  const book = await prisma.book.findUnique({
    include: {
      authors: true,
      format: true,
      genre: true,
      publisher: true,
    },
    where: { isbn13 },
  });

  if (book) {
    return {
      ...book,
      publisher: serializeBookSource(book.publisher),
    };
  } else {
    return null;
  }
}
