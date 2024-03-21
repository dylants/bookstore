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
import NegativeBookQuantityError from '@/lib/errors/NegativeBookQuantityError';
import _ from 'lodash';

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

export async function createBook(book: BookCreateInput): Promise<BookHydrated> {
  logger.trace('createBook, book: %j', book);

  return prisma.$transaction(
    async (tx) => {
      const data = await buildCreateUpdateBookData(tx, book);

      const createdBook = await tx.book.create({
        data: data as Prisma.BookCreateInput,
        include: {
          authors: true,
          format: true,
          genre: true,
          publisher: true,
        },
      });

      logger.trace('created book in DB: %j', createdBook);

      return {
        ...createdBook,
        publisher: serializeBookSource(createdBook.publisher),
      };
    },
    {
      // when we create a book, we create authors and publisher if they do not exist
      // so this entire operation needs to be executed in serial
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function upsertBook(book: BookCreateInput): Promise<BookHydrated> {
  logger.trace('upsertBook, book: %j', book);

  return prisma.$transaction(
    async (tx) => {
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
    },
    {
      // when we create a book, we create authors and publisher if they do not exist
      // so this entire operation needs to be executed in serial
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

/**
 * Reduces all book updates by book ID
 */
export function reduceBookUpdates(
  items: Array<{
    bookId: number | null;
    productType: ProductType;
    quantity: number;
  }>,
): Array<{ decreasedQuantity: number; id: number; increasedQuantity: number }> {
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
 * Attempts to update the Book by the quantityChange.
 *
 * @throws NegativeBookQuantityError if quantity change results in negative quantity
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

  if (updatedQuantity < 0) {
    logger.error(
      'Unable to process update, attempting to set a negative quantity',
    );
    throw new NegativeBookQuantityError(book);
  }

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

export async function findBooksBySearchString(
  searchString: string,
): Promise<Array<BookHydrated>> {
  let whereClauses: Prisma.BookWhereInput[];
  const searchStringNumber = _.toNumber(searchString);
  if (_.isFinite(searchStringNumber)) {
    whereClauses = [{ isbn13: { equals: searchStringNumber } }];
  } else {
    const search = searchString.split(' ').join(' & ');
    whereClauses = [
      { authors: { some: { name: { search } } } },
      { title: { search } },
    ];
  }

  const rawBooks = await prisma.book.findMany({
    include: {
      authors: true,
      format: true,
      genre: true,
      publisher: true,
    },
    where: {
      OR: whereClauses,
    },
  });

  const books = rawBooks.map((book) => ({
    ...book,
    publisher: serializeBookSource(book.publisher),
  }));

  logger.trace('books found: %j', books);

  return books;
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
