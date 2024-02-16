import {
  buildAuthorsInput,
  buildPublisherInput,
  createBook,
  findBookBySearchString,
  getBook,
  getBooks,
  upsertBook,
} from '@/lib/actions/book';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { randomBookHydrated } from '@/lib/fakes/book';
import { Author, BookSource } from '@prisma/client';

describe('book actions', () => {
  const book1 = randomBookHydrated();
  const book2 = randomBookHydrated();
  const book3 = randomBookHydrated();

  describe('buildAuthorsInput', () => {
    it('should return valid input for a single author that exists', async () => {
      prismaMock.author.findFirst.mockResolvedValue({
        id: 1,
      } as Author);

      const input = await buildAuthorsInput('author one');
      expect(input).toEqual({
        connect: [{ id: 1 }],
        create: [],
      });
    });

    it('should return valid input for a single author that does NOT exist', async () => {
      prismaMock.author.findFirst.mockResolvedValue(null);

      const input = await buildAuthorsInput('author one');
      expect(input).toEqual({
        connect: [],
        create: [{ name: 'author one' }],
      });
    });

    it('should return valid input for multiple authors', async () => {
      prismaMock.author.findFirst.mockResolvedValueOnce({
        id: 1,
      } as Author);
      prismaMock.author.findFirst.mockResolvedValueOnce(null);
      prismaMock.author.findFirst.mockResolvedValueOnce({
        id: 3,
      } as Author);
      prismaMock.author.findFirst.mockResolvedValueOnce(null);

      const input = await buildAuthorsInput(
        'author one, author 2, author 3, author 4',
      );
      expect(input).toEqual({
        connect: [{ id: 1 }, { id: 3 }],
        create: [{ name: 'author 2' }, { name: 'author 4' }],
      });
    });
  });

  describe('buildPublisherInput', () => {
    it('should return valid input for a publisher that exists', async () => {
      prismaMock.bookSource.findFirst.mockResolvedValue({
        id: 1,
      } as BookSource);

      const input = await buildPublisherInput('publisher one');
      expect(input).toEqual({
        connect: { id: 1 },
      });
    });

    it('should return valid input for a publisher that does NOT exist', async () => {
      prismaMock.bookSource.findFirst.mockResolvedValue(null);

      const input = await buildPublisherInput('publisher one');
      expect(input).toEqual({
        create: {
          isPublisher: true,
          isVendor: false,
          name: 'publisher one',
        },
      });
    });
  });

  describe('createBook', () => {
    it('should create a new book', async () => {
      prismaMock.author.findFirst.mockResolvedValue(null);
      prismaMock.bookSource.findFirst.mockResolvedValue(null);
      prismaMock.bookSource.findUniqueOrThrow.mockResolvedValue(book1.vendor);
      prismaMock.book.create.mockResolvedValue(book1);

      const result = await createBook({
        ...book1,
        authors: 'author1',
        publisher: 'publisher2',
      });

      expect(prismaMock.author.findFirst).toHaveBeenCalledWith({
        where: { name: 'author1' },
      });

      expect(prismaMock.bookSource.findFirst).toHaveBeenCalledWith({
        where: { name: 'publisher2' },
      });
      expect(prismaMock.bookSource.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: book1.vendorId },
      });

      expect(prismaMock.book.create).toHaveBeenCalledWith({
        data: {
          authors: {
            connect: [],
            create: [
              {
                name: 'author1',
              },
            ],
          },
          format: book1.format,
          genre: book1.genre,
          imageUrl: book1.imageUrl,
          isbn13: book1.isbn13,
          publishedDate: book1.publishedDate,
          publisher: {
            create: {
              isPublisher: true,
              isVendor: false,
              name: 'publisher2',
            },
          },
          title: book1.title,
          vendor: {
            connect: {
              id: book1.vendorId,
            },
          },
        },
        include: {
          authors: true,
          publisher: true,
          vendor: true,
        },
      });

      expect(result).toEqual(book1);
    });
  });

  describe('upsertBook', () => {
    it('should provide the correct data', async () => {
      prismaMock.author.findFirst.mockResolvedValue(null);
      prismaMock.bookSource.findFirst.mockResolvedValue(null);
      prismaMock.bookSource.findUniqueOrThrow.mockResolvedValue(book1.vendor);
      prismaMock.book.upsert.mockResolvedValue(book1);

      const result = await upsertBook({
        ...book1,
        authors: 'author1',
        publisher: 'publisher2',
      });

      expect(prismaMock.book.upsert).toHaveBeenCalledWith({
        create: {
          authors: {
            connect: [],
            create: [
              {
                name: 'author1',
              },
            ],
          },
          format: book1.format,
          genre: book1.genre,
          imageUrl: book1.imageUrl,
          isbn13: book1.isbn13,
          publishedDate: book1.publishedDate,
          publisher: {
            create: {
              isPublisher: true,
              isVendor: false,
              name: 'publisher2',
            },
          },
          title: book1.title,
          vendor: {
            connect: {
              id: book1.vendorId,
            },
          },
        },
        include: {
          authors: true,
          publisher: true,
          vendor: true,
        },
        update: {
          authors: {
            connect: [],
            create: [
              {
                name: 'author1',
              },
            ],
          },
          format: book1.format,
          genre: book1.genre,
          imageUrl: book1.imageUrl,
          isbn13: book1.isbn13,
          publishedDate: book1.publishedDate,
          publisher: {
            create: {
              isPublisher: true,
              isVendor: false,
              name: 'publisher2',
            },
          },
          title: book1.title,
          vendor: {
            connect: {
              id: book1.vendorId,
            },
          },
        },
        where: {
          isbn13: book1.isbn13,
        },
      });

      expect(result).toEqual(book1);
    });
  });

  describe('getBooks', () => {
    it('should get books when provided with default input', async () => {
      prismaMock.book.findMany.mockResolvedValue([book1, book2, book3]);

      const result = await getBooks({});

      expect(result).toEqual({
        books: [book1, book2, book3],
        pageInfo: {
          endCursor: book3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: book1.id.toString(),
        },
      });
    });

    it('should get books when provided with pagination query input', async () => {
      prismaMock.book.findMany.mockResolvedValue([book2, book3]);

      const result = await getBooks({
        paginationQuery: {
          after: '1',
          first: 2,
        },
      });

      expect(result).toEqual({
        books: [book2, book3],
        pageInfo: {
          endCursor: book3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: book2.id.toString(),
        },
      });
    });
  });

  describe('findBookBySearchString', () => {
    it('should find books that contain "Book"', async () => {
      prismaMock.book.findMany.mockResolvedValue([book1, book2, book3]);

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

  describe('getBook', () => {
    it('should provide the correct input to prisma', async () => {
      prismaMock.book.findUnique.mockResolvedValue(book1);

      const isbn13 = BigInt(1);
      const result = await getBook(isbn13);

      expect(prismaMock.book.findUnique).toHaveBeenCalledWith({
        include: {
          authors: true,
          publisher: true,
          vendor: true,
        },
        where: { isbn13 },
      });
      expect(result).toEqual(book1);
    });
  });
});
