'use server';

import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import { Book } from '@prisma/client';
import { Book as BookType } from '@/types/Book';

export async function createBook(book: BookType): Promise<Book> {
  logger.trace('createBook, book: %j', book);

  const createdBook: Book = await prisma.book.create({
    data: book,
  });

  logger.trace('created book in DB: %j', createdBook);
  return createdBook;
}

export async function getBooks(): Promise<Array<Book>> {
  const books = await prisma.book.findMany();
  return books;
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
