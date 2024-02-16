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
import { Prisma } from '@prisma/client';

export async function buildAuthorsInput(
  authors: string,
): Promise<Prisma.AuthorCreateNestedManyWithoutBooksInput> {
  const authorStrings = authors.split(',').map((a) => a.trim());
  const authorsConnectInput: Prisma.AuthorWhereUniqueInput[] = [];
  const authorsCreateInput: Prisma.AuthorCreateWithoutBooksInput[] = [];

  await Promise.all(
    authorStrings.map(async (authorString) => {
      const author = await prisma.author.findFirst({
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
  publisherString: string,
): Promise<Prisma.BookSourceCreateNestedOneWithoutBooksInput> {
  const publisher = await prisma.bookSource.findFirst({
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
  book: BookCreateInput,
): Promise<Prisma.BookCreateInput | Prisma.BookUpdateInput> {
  const authors = await buildAuthorsInput(book.authors);

  const publisher = await buildPublisherInput(book.publisher);

  const vendor = await prisma.bookSource.findUniqueOrThrow({
    where: {
      id: book.vendorId,
    },
  });

  return {
    authors,
    format: book.format,
    genre: book.genre,
    imageUrl: book.imageUrl,
    isbn13: book.isbn13,
    publishedDate: book.publishedDate,
    publisher,
    title: book.title,
    vendor: {
      connect: {
        id: vendor.id,
      },
    },
  };
}

export async function createBook(book: BookCreateInput): Promise<BookHydrated> {
  logger.trace('createBook, book: %j', book);

  const data = (await buildCreateUpdateBookData(
    book,
  )) as Prisma.BookCreateInput;

  const createdBook = await prisma.book.create({
    data,
    include: {
      authors: true,
      publisher: true,
      vendor: true,
    },
  });

  logger.trace('created book in DB: %j', createdBook);

  return createdBook;
}

export async function upsertBook(book: BookCreateInput): Promise<BookHydrated> {
  logger.trace('upsertBook, book: %j', book);

  const data = await buildCreateUpdateBookData(book);

  const upsertedBook = await prisma.book.upsert({
    create: data as Prisma.BookCreateInput,
    include: {
      authors: true,
      publisher: true,
      vendor: true,
    },
    update: data as Prisma.BookUpdateInput,
    where: { isbn13: book.isbn13 },
  });

  logger.trace('upsertedBook in DB: %j', upsertedBook);

  return upsertedBook;
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

  const items = await prisma.book.findMany({
    ...paginationRequest,
    include: {
      authors: true,
      publisher: true,
      vendor: true,
    },
  });

  const { items: books, pageInfo } = buildPaginationResponse<BookHydrated>({
    items,
    paginationQuery,
  });

  return {
    books,
    pageInfo,
  };
}

export async function findBookBySearchString(
  search: string,
): Promise<Array<BookHydrated>> {
  const books = await prisma.book.findMany({
    include: {
      authors: true,
      publisher: true,
      vendor: true,
    },
    where: {
      OR: [{ authors: { some: { name: { search } } } }, { title: { search } }],
    },
  });
  logger.trace('books found: %j', books);

  return books;
}
