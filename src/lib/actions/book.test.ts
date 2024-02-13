import {
  BookFull,
  createBook,
  findBookBySearchString,
  getBooks,
} from '@/lib/actions/book';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { Book, Format, Genre } from '@prisma/client';
import BookType from '@/types/Book';
import _ from 'lodash';

function convertTypeToDb(book: BookType, id: number): BookFull {
  return {
    authors: [{ id, imageUrl: '', name: book.author }],
    // TODO fixme
    format: Format.HARDCOVER,
    // TODO fixme
    genre: Genre.LITERARY_FICTION,
    id,
    imageUrl: book.imageUrl,
    isbn13: BigInt(_.toNumber(book.isbn)),
    publishedDate: book.publishedDate,
    publisher: { id, name: book.publisher },
    publisherId: id,
    title: book.title,
    vendorId: id,
  };
}

describe('book actions', () => {
  // TODO use fakes
  const book1: BookType = {
    author: 'Biff Spiffington',
    genre: Genre.LITERARY_FICTION,
    imageUrl: 'https://img.com',
    isbn: '123',
    publishedDate: new Date('2000-01-02'),
    publisher: 'My Publisher',
    title: 'My Book',
  };
  const book1db: Book = convertTypeToDb(book1, 1);

  const book2: BookType = {
    author: 'Jane Doe',
    genre: Genre.LITERARY_FICTION,
    imageUrl: 'https://img2.com',
    isbn: '345',
    publishedDate: new Date('2001-02-03'),
    publisher: 'My Other Publisher',
    title: 'My Book 2',
  };
  const book2db: Book = convertTypeToDb(book2, 2);

  const book3: BookType = {
    author: 'John Doe',
    genre: Genre.LITERARY_FICTION,
    imageUrl: 'https://img3.com',
    isbn: '567',
    publishedDate: new Date('2002-03-04'),
    publisher: 'That Publisher',
    title: 'My Book 3',
  };
  const book3db: Book = convertTypeToDb(book3, 3);

  describe('createBook', () => {
    it('should create a new book', async () => {
      prismaMock.author.findFirst.mockResolvedValue(null);
      prismaMock.bookSource.findFirst.mockResolvedValue(null);
      prismaMock.book.create.mockResolvedValue(book1db);

      await expect(createBook(book1)).resolves.toEqual(book1);
    });
  });

  describe('getBooks', () => {
    it('should get books when provided with default input', async () => {
      prismaMock.book.findMany.mockResolvedValue([book1db, book2db, book3db]);

      const result = await getBooks({});

      expect(result).toEqual({
        books: [book1, book2, book3],
        pageInfo: {
          endCursor: '3',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: '1',
        },
      });
    });

    it('should get books when provided with pagination query input', async () => {
      prismaMock.book.findMany.mockResolvedValue([book2db, book3db]);

      const result = await getBooks({
        paginationQuery: {
          after: '1',
          first: 2,
        },
      });

      expect(result).toEqual({
        books: [book2, book3],
        pageInfo: {
          endCursor: '3',
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: '2',
        },
      });
    });
  });

  describe('findBookBySearchString', () => {
    it('should find books that contain "Book"', async () => {
      prismaMock.book.findMany.mockResolvedValue([book1db, book2db, book3db]);

      const result = await findBookBySearchString('Book');

      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        include: {
          authors: true,
          publisher: true,
          vendor: true,
        },
        where: {
          OR: [
            { authors: { some: { name: { search: 'Book' } } } },
            { title: { search: 'Book' } },
          ],
        },
      });
      expect(result).toEqual([book1, book2, book3]);
    });
  });
});
