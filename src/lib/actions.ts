"use server";

import logger from "@/lib/logger";
import { Book } from "@/types/Book";

export async function createBook(book: Book) {
  logger.trace("createBook, book: %j", book);
  await new Promise((res) => setTimeout(res, 1000));
  logger.trace("created book in DB");
  return;
}

export async function getBooks(): Promise<Array<Book>> {
  await new Promise((res) => setTimeout(res, 1000));
  return [];
}
