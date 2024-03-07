import { Book } from '@prisma/client';

export default class NegativeBookQuantityError extends Error {
  public book: Book;

  constructor(book: Book) {
    super('Attempting to set a negative quantity for Book');
    this.name = 'NegativeBookQuantityError';
    this.book = book;
  }
}
