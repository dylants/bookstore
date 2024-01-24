'use server';

import logger from '@/lib/logger';
import {
  buildEndCursor,
  buildStartCursor,
  findLimit,
  isValidPaginationQuery,
  parseCursorAsId,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { Book } from '@prisma/client';
import BookType from '@/types/Book';
import PageInfo from '@/types/PageInfo';
import _ from 'lodash';
import PaginationQuery from '@/types/PaginationQuery';

export async function createBook(book: BookType): Promise<Book> {
  logger.trace('createBook, book: %j', book);

  const createdBook: Book = await prisma.book.create({
    data: book,
  });

  logger.trace('created book in DB: %j', createdBook);
  return createdBook;
}

export interface GetBooksParams {
  paginationQuery: PaginationQuery;
}

export interface GetBooksResult {
  books: Array<Book>;
  pageInfo: PageInfo;
}

export async function getBooks({
  paginationQuery,
}: GetBooksParams): Promise<GetBooksResult> {
  if (!isValidPaginationQuery(paginationQuery)) {
    throw new Error('invalid pagination query');
  }

  // https://www.prisma.io/docs/orm/prisma-client/queries/pagination
  const take = findLimit(paginationQuery);
  const id = parseCursorAsId(paginationQuery);
  const cursor = id ? { id } : undefined;
  const skip = cursor ? 1 : undefined;

  logger.trace('cursor: %o skip: %d take: %d', cursor, skip, take);

  const books = await prisma.book.findMany({
    cursor,
    orderBy: {
      id: 'asc',
    },
    skip,
    take,
  });

  logger.trace(
    'returning books of length %d with ids %j',
    books.length,
    books.map((b) => b.id),
  );

  return {
    books,
    pageInfo: {
      endCursor: buildEndCursor(books),
      // TODO
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: buildStartCursor(books),
    },
  };
}

export async function findBookBySearchString(
  search: string,
): Promise<Array<Book>> {
  const books = await prisma.book.findMany({
    where: {
      OR: [{ author: { search } }, { title: { search } }],
    },
  });
  logger.trace('books found: %j', books);
  return books;
}
