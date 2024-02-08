'use server';

import logger from '@/lib/logger';
import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { Author, Book, BookSource, Format, Genre } from '@prisma/client';
import BookType from '@/types/Book';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import _ from 'lodash';

export interface BookFull extends Book {
  authors: Author[];
  publisher: BookSource;
}

function convertDbToType(book: BookFull): BookType {
  return {
    author: book.authors.map((a) => a.name).join(', '),
    genre: book.genre,
    imageUrl: book.imageUrl,
    isbn: book.isbn13.toString(),
    publishedDate: book.publishedDate,
    publisher: book.publisher.name,
    title: book.title,
  };
}

export async function createBook(book: BookType): Promise<BookType> {
  logger.trace('createBook, book: %j', book);

  // TODO how do we find multiple authors?
  const author = await prisma.author.findFirst({
    where: { name: book.author },
  });

  const publisher = await prisma.bookSource.findFirst({
    where: { name: book.publisher },
  });

  // TODO include vendor
  const vendor = await prisma.bookSource.findFirst({
    where: { name: book.publisher },
  });

  const createdBook = await prisma.book.create({
    data: {
      authors: {
        connectOrCreate: {
          create: {
            name: book.author,
          },
          // TODO fixme
          where: { id: author?.id ?? -1 },
        },
      },
      // TODO fixme
      format: Format.HARDCOVER,
      // TODO fixme
      genre: Genre.LITERARY_FICTION,
      imageUrl: book.imageUrl,
      // TODO fixme
      isbn13: _.toNumber(book.isbn),
      publishedDate: book.publishedDate,
      publisher: {
        connectOrCreate: {
          create: {
            name: book.publisher,
          },
          // TODO fixme
          where: { id: publisher?.id ?? -1 },
        },
      },
      title: book.title,
      vendor: {
        connectOrCreate: {
          create: {
            name: book.publisher,
          },
          // TODO fixme
          where: { id: vendor?.id ?? -1 },
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

  return convertDbToType(createdBook);
}

export interface GetBooksParams {
  paginationQuery?: PaginationQuery;
}

export interface GetBooksResult {
  books: Array<BookType>;
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

  const { items: books, pageInfo } = buildPaginationResponse<BookFull>({
    items,
    paginationQuery,
  });

  return {
    books: books.map(convertDbToType),
    pageInfo,
  };
}

export async function findBookBySearchString(
  search: string,
): Promise<Array<BookType>> {
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

  return books.map(convertDbToType);
}
