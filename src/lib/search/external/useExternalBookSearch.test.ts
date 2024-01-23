import useExternalBookSearch, {
  GoogleSearchResponse,
  UseExternalBookSearchResult,
} from '@/lib/search/external/useExternalBookSearch';
import { Book } from '@/types/Book';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

describe('useExternalBookSearch', () => {
  const GOOGLE_BOOK_FOUND: GoogleSearchResponse = {
    items: [
      {
        volumeInfo: {
          authors: ['Cressida Cowell'],
          categories: ['Juvenile Fiction'],
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
          publishedDate: new Date('2010-02-01'),
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

  let search: UseExternalBookSearchResult;
  beforeEach(() => {
    search = useExternalBookSearch();
  });

  describe('search by ISBN', () => {
    const isbn = '123';

    describe('when the book exists', () => {
      const server = setupServer(
        rest.get('https://www.googleapis.com/*', (_, res, ctx) => {
          return res(ctx.json(GOOGLE_BOOK_FOUND));
        }),
      );
      const book: Book = {
        author: 'Cressida Cowell',
        genre: 'Juvenile Fiction',
        imageUrl:
          'https://books.google.com/books/content?id=28_qngEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        isbn: '9780316085274',
        publishedDate: new Date('2010-02-01'),
        publisher: 'Little Brown & Company',
        title: 'How to Train Your Dragon',
      };

      beforeAll(() => server.listen());
      afterEach(() => server.resetHandlers());
      afterAll(() => server.close());

      it('should return the book details', async () => {
        const result = await search({ isbn });
        expect(result).not.toBeNull();
        expect(result).toEqual(book);
      });
    });

    describe('when the book exists without detail', () => {
      const server = setupServer(
        rest.get('https://www.googleapis.com/*', (_, res, ctx) => {
          return res(ctx.json(GOOGLE_BOOK_FOUND_WITHOUT_DETAIL));
        }),
      );
      const book: Book = {
        author: '',
        genre: '',
        imageUrl: null,
        isbn: '',
        publishedDate: null,
        publisher: 'Little Brown & Company',
        title: 'How to Train Your Dragon',
      };

      beforeAll(() => server.listen());
      afterEach(() => server.resetHandlers());
      afterAll(() => server.close());

      it('should return the book details', async () => {
        const result = await search({ isbn });
        expect(result).not.toBeNull();
        expect(result).toEqual(book);
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

      it('should return null', async () => {
        const result = await search({ isbn });
        expect(result).toBeNull();
      });
    });
  });
});
