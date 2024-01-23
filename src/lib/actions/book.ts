'use server';

import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import { Book } from '@/types/Book';

export async function createBook(book: Book) {
  logger.trace('createBook, book: %j', book);

  const created = await prisma.book.create({
    data: book,
  });

  logger.trace('created book in DB: %j', created);
  return;
}

export async function getBooks(): Promise<Array<Book>> {
  const books = await prisma.book.findMany();
  return books;
}
