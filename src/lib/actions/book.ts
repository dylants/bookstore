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

export async function createBook(book: BookCreateInput): Promise<BookHydrated> {
  logger.trace('createBook, book: %j', book);

  const authorsInput = await buildAuthorsInput(book.authors);

  const publisher = await prisma.bookSource.findFirst({
    where: { name: book.publisher },
  });

  const vendor = await prisma.bookSource.findUniqueOrThrow({
    where: {
      id: book.vendorId,
    },
  });

  const createdBook = await prisma.book.create({
    data: {
      authors: authorsInput,
      format: book.format,
      genre: book.genre,
      imageUrl: book.imageUrl,
      isbn13: book.isbn13,
      publishedDate: book.publishedDate,
      publisher: {
        connectOrCreate: {
          create: {
            // TODO we need better logic to determine if publisher/vendor
            isPublisher: true,
            isVendor: false,
            name: book.publisher,
          },
          // TODO fixme
          where: { id: publisher?.id ?? -1 },
        },
      },
      title: book.title,
      vendor: {
        connect: {
          id: vendor.id,
        },
      },
    },
    include: {
      authors: true,
      publisher: true,
      vendor: true,
    },
  });

  logger.trace('created book in DB: %j', createdBook);

  return createdBook;
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
