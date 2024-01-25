'use server';

import logger from '@/lib/logger';
import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { Book } from '@prisma/client';
import BookType from '@/types/Book';
import PageInfo from '@/types/PageInfo';
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
  paginationQuery?: PaginationQuery;
}

export interface GetBooksResult {
  books: Array<Book>;
  pageInfo: PageInfo;
}

export async function getBooks({
  paginationQuery,
}: GetBooksParams): Promise<GetBooksResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const items = await prisma.book.findMany({
    ...paginationRequest,
  });

  const { items: books, pageInfo } = buildPaginationResponse<Book>({
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
): Promise<Array<Book>> {
  const books = await prisma.book.findMany({
    where: {
      OR: [{ author: { search } }, { title: { search } }],
    },
  });
  logger.trace('books found: %j', books);
  return books;
}
