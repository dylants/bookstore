import { GoogleSearchResponse, googleBookSearch } from '@/lib/search/google';
import BookFormInput from '@/types/BookFormInput';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockFindGenreOrThrow = jest.fn();
jest.mock('../actions/genre', () => ({
  findGenreOrThrow: (...args: unknown[]) => mockFindGenreOrThrow(...args),
}));

describe('google search', () => {
  const GOOGLE_BOOK_FOUND: GoogleSearchResponse = {
    items: [
      {
        volumeInfo: {
          authors: ['Cressida Cowell'],
          categories: ['YOUNG_ADULT_FANTASY'],
          imageLinks: {
            thumbnail:
              'http://books.google.com/books/content?id=28_qngEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
          },
          industryIdentifiers: [
            {
              identifier: '0316085278',
              type: 'ISBN_10',
            },
            {
              identifier: '9780316085274',
              type: 'ISBN_13',
            },
          ],
          publishedDate: '2010-02-01',
          publisher: 'Little Brown & Company',
          title: 'How to Train Your Dragon',
        },
      },
    ],
    totalItems: 1,
  };

  const GOOGLE_BOOK_FOUND_WITHOUT_DETAIL: GoogleSearchResponse = {
    items: [
      {
        volumeInfo: {
          industryIdentifiers: [],
          publisher: 'Little Brown & Company',
          title: 'How to Train Your Dragon',
        },
      },
    ],
    totalItems: 1,
  };

  const GOOGLE_BOOK_NOT_FOUND: GoogleSearchResponse = {
    items: [],
    totalItems: 0,
  };

  describe('googleBookSearch', () => {
    const isbn13 = '123';

    beforeEach(() => {
      mockFindGenreOrThrow.mockReset();
    });

    describe('when the book exists', () => {
      const server = setupServer(
        rest.get('https://www.googleapis.com/*', (_, res, ctx) => {
          return res(ctx.json(GOOGLE_BOOK_FOUND));
        }),
      );
      const book: Partial<BookFormInput> = {
        authors: 'Cressida Cowell',
        genreId: 23,
        imageUrl:
          'https://books.google.com/books/content?id=28_qngEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2010-02-01',
        publisher: 'Little Brown & Company',
        title: 'How to Train Your Dragon',
      };

      beforeAll(() => server.listen());
      afterEach(() => server.resetHandlers());
      afterAll(() => server.close());

      it('should return the book details', async () => {
        mockFindGenreOrThrow.mockReturnValue({ id: 23 });
        const result = await googleBookSearch({ isbn13 });
        expect(result).not.toBeNull();
        expect(result).toEqual({
          ...book,
          isbn13,
        });
      });
    });

    describe('when the book exists without detail', () => {
      const server = setupServer(
        rest.get('https://www.googleapis.com/*', (_, res, ctx) => {
          return res(ctx.json(GOOGLE_BOOK_FOUND_WITHOUT_DETAIL));
        }),
      );
      const book: Partial<BookFormInput> = {
        publisher: 'Little Brown & Company',
        title: 'How to Train Your Dragon',
      };

      beforeAll(() => server.listen());
      afterEach(() => server.resetHandlers());
      afterAll(() => server.close());

      it('should return the book details', async () => {
        const result = await googleBookSearch({ isbn13 });
        expect(result).not.toBeNull();
        expect(result).toEqual({
          ...book,
          isbn13,
        });
      });
    });

    describe('when the book does NOT exist', () => {
      const server = setupServer(
        rest.get('https://www.googleapis.com/*', (_, res, ctx) => {
          return res(ctx.json(GOOGLE_BOOK_NOT_FOUND));
        }),
      );

      beforeAll(() => server.listen());
      afterEach(() => server.resetHandlers());
      afterAll(() => server.close());

      it('should return book with just input isbn', async () => {
        const result = await googleBookSearch({ isbn13 });
        expect(result).toEqual({ isbn13 });
      });
    });
  });
});
