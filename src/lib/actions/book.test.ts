import {
  createBook,
  findBookBySearchString,
  getBooks,
} from '@/lib/actions/book';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { Book } from '@prisma/client';
import BookType from '@/types/Book';

describe('book actions', () => {
  const book1: BookType = {
    author: 'Biff Spiffington',
    genre: 'Fiction',
    imageUrl: 'https://img.com',
    isbn: '123',
    publishedDate: new Date('2000-01-02'),
    publisher: 'My Publisher',
    title: 'My Book',
  };
  const book1db: Book = { ...book1, id: 1 };

  const book2: BookType = {
    author: 'Jane Doe',
    genre: 'Non-Fiction',
    imageUrl: 'https://img2.com',
    isbn: '345',
    publishedDate: new Date('2001-02-03'),
    publisher: 'My Other Publisher',
    title: 'My Book 2',
  };
  const book2db: Book = { ...book2, id: 2 };

  const book3: BookType = {
    author: 'John Doe',
    genre: 'Fiction',
    imageUrl: 'https://img3.com',
    isbn: '567',
    publishedDate: new Date('2002-03-04'),
    publisher: 'That Publisher',
    title: 'My Book 3',
  };
  const book3db: Book = { ...book3, id: 3 };

  describe('createBook', () => {
    it('should create a new book', async () => {
      prismaMock.book.create.mockResolvedValue(book1db);

      await expect(createBook(book1)).resolves.toEqual({
        author: 'Biff Spiffington',
        genre: 'Fiction',
        id: 1,
        imageUrl: 'https://img.com',
        isbn: '123',
        publishedDate: new Date('2000-01-02'),
        publisher: 'My Publisher',
        title: 'My Book',
      });
    });
  });

  describe('getBooks', () => {
    it('should get books when provided with default input', async () => {
      prismaMock.book.findMany.mockResolvedValue([book1db, book2db, book3db]);

      const result = await getBooks({});

      expect(result).toEqual({
        books: [book1db, book2db, book3db],
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
        books: [book2db, book3db],
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
        where: {
          OR: [{ author: { search: 'Book' } }, { title: { search: 'Book' } }],
        },
      });
      expect(result).toEqual([book1db, book2db, book3db]);
    });
  });
});
