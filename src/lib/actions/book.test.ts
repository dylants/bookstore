import {
  buildAuthorsInput,
  buildPublisherInput,
  createBook,
  findBooksBySearchString,
  getBook,
  getBooks,
  upsertBook,
} from '@/lib/actions/book';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeBookHydrated } from '@/lib/fakes/book';
import { Author, BookSource } from '@prisma/client';

describe('book actions', () => {
  const book1 = fakeBookHydrated();
  const book2 = fakeBookHydrated();
  const book3 = fakeBookHydrated();

  describe('buildAuthorsInput', () => {
    it('should return valid input for a single author that exists', async () => {
      prismaMock.author.findFirst.mockResolvedValue({
        id: 1,
      } as Author);

      const input = await buildAuthorsInput(prismaMock, 'author one');
      expect(input).toEqual({
        connect: [{ id: 1 }],
        create: [],
      });
    });

    it('should return valid input for a single author that does NOT exist', async () => {
      prismaMock.author.findFirst.mockResolvedValue(null);

      const input = await buildAuthorsInput(prismaMock, 'author one');
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
        prismaMock,
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

      const input = await buildPublisherInput(prismaMock, 'publisher one');
      expect(input).toEqual({
        connect: { id: 1 },
      });
    });

    it('should return valid input for a publisher that does NOT exist', async () => {
      prismaMock.bookSource.findFirst.mockResolvedValue(null);

      const input = await buildPublisherInput(prismaMock, 'publisher one');
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
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      prismaMock.author.findFirst.mockResolvedValue(null);
      prismaMock.bookSource.findFirst.mockResolvedValue(null);
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
          format: { connect: { id: book1.formatId } },
          genre: { connect: { id: book1.genreId } },
          imageUrl: book1.imageUrl,
          isbn13: book1.isbn13,
          priceInCents: book1.priceInCents,
          publishedDate: book1.publishedDate,
          publisher: {
            create: {
              isPublisher: true,
              isVendor: false,
              name: 'publisher2',
            },
          },
          quantity: book1.quantity,
          title: book1.title,
        },
        include: {
          authors: true,
          format: true,
          genre: true,
          publisher: true,
        },
      });

      expect(result).toEqual(book1);
    });
  });

  describe('upsertBook', () => {
    it('should provide the correct data', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      prismaMock.author.findFirst.mockResolvedValue(null);
      prismaMock.bookSource.findFirst.mockResolvedValue(null);
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
          format: { connect: { id: book1.formatId } },
          genre: { connect: { id: book1.genreId } },
          imageUrl: book1.imageUrl,
          isbn13: book1.isbn13,
          priceInCents: book1.priceInCents,
          publishedDate: book1.publishedDate,
          publisher: {
            create: {
              isPublisher: true,
              isVendor: false,
              name: 'publisher2',
            },
          },
          quantity: book1.quantity,
          title: book1.title,
        },
        include: {
          authors: true,
          format: true,
          genre: true,
          publisher: true,
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
          format: { connect: { id: book1.formatId } },
          genre: { connect: { id: book1.genreId } },
          imageUrl: book1.imageUrl,
          isbn13: book1.isbn13,
          priceInCents: book1.priceInCents,
          publishedDate: book1.publishedDate,
          publisher: {
            create: {
              isPublisher: true,
              isVendor: false,
              name: 'publisher2',
            },
          },
          quantity: book1.quantity,
          title: book1.title,
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

  describe('findBooksBySearchString', () => {
    it('should find books that contain "Book"', async () => {
      prismaMock.book.findMany.mockResolvedValue([book1, book2, book3]);

      const result = await findBooksBySearchString('Book');

      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        include: {
          authors: true,
          format: true,
          genre: true,
          publisher: true,
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

    it('should process multiple words', async () => {
      prismaMock.book.findMany.mockResolvedValue([book2]);

      const result = await findBooksBySearchString('the other book');

      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        include: {
          authors: true,
          format: true,
          genre: true,
          publisher: true,
        },
        where: {
          OR: [
            { authors: { some: { name: { search: 'the & other & book' } } } },
            { title: { search: 'the & other & book' } },
          ],
        },
      });
      expect(result).toEqual([book2]);
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
          format: true,
          genre: true,
          publisher: true,
        },
        where: { isbn13 },
      });
      expect(result).toEqual(book1);
    });

    it('should return null when no book exists', async () => {
      prismaMock.book.findUnique.mockResolvedValue(null);
      const result = await getBook(BigInt(1));
      expect(result).toEqual(null);
    });
  });
});
