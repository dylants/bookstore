import { fakeAuthor } from '@/lib/fakes/author';
import { fakePublisherSerialized } from '@/lib/fakes/book-source';
import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { fakeFormat } from '@/lib/fakes/format';
import { fakeGenre } from '@/lib/fakes/genre';
import {
  transformBookFormInputToBookCreateInput,
  transformBookHydratedToBookFormInput,
} from '@/lib/transformers/book';
import BookCreateInput from '@/types/BookCreateInput';
import BookFormInput from '@/types/BookFormInput';
import BookHydrated from '@/types/BookHydrated';

const mockFindFormatOrThrow = jest.fn();
jest.mock('../actions/format', () => ({
  findFormatOrThrow: (...args: unknown[]) => mockFindFormatOrThrow(...args),
}));

const mockFindGenreOrThrow = jest.fn();
jest.mock('../actions/genre', () => ({
  findGenreOrThrow: (...args: unknown[]) => mockFindGenreOrThrow(...args),
}));

describe('book transformers', () => {
  const date = new Date('2000-01-02T06:00:00.000Z');
  const bookHydrated: BookHydrated = {
    ...fakeCreatedAtUpdatedAt(),
    authors: [
      { ...fakeAuthor(), name: 'Author 1' },
      { ...fakeAuthor(), name: 'Author 2' },
    ],
    format: {
      ...fakeFormat(),
      id: 2,
    },
    formatId: 2,
    genre: {
      ...fakeGenre(),
      id: 3,
    },
    genreId: 3,
    id: 123,
    imageUrl: 'http://image.com',
    isbn13: BigInt('987'),
    priceInCents: 1999,
    publishedDate: date,
    publisher: {
      ...fakePublisherSerialized(),
      name: 'Publisher 1',
    },
    publisherId: 1,
    quantity: 12,
    title: 'My Book',
  };
  const bookFormInput: BookFormInput = {
    authors: 'Author 1, Author 2',
    discountPercentageDisplay: undefined,
    formatId: 2,
    genreId: 3,
    imageUrl: 'http://image.com',
    isbn13: '987',
    priceInCents: '19.99',
    publishedDate: '2000-01-02',
    publisher: 'Publisher 1',
    quantity: '12',
    title: 'My Book',
  };
  const bookCreateInput: BookCreateInput = {
    authors: 'Author 1, Author 2',
    formatId: 2,
    genreId: 3,
    imageUrl: 'http://image.com',
    isbn13: BigInt('987'),
    priceInCents: 1999,
    publishedDate: new Date('2000-01-02T06:00:00.000Z'),
    publisher: 'Publisher 1',
    quantity: 12,
    title: 'My Book',
  };

  describe('transformBookHydratedToBookFormInput', () => {
    it('should work with a fully populated book', () => {
      expect(
        transformBookHydratedToBookFormInput({
          bookHydrated,
          timezone: 'America/Chicago',
        }),
      ).toEqual(bookFormInput);
    });

    it('should work with a book without optional fields', () => {
      expect(
        transformBookHydratedToBookFormInput({
          bookHydrated: {
            ...bookHydrated,
            publishedDate: null,
          },
          timezone: 'America/Chicago',
        }),
      ).toEqual({
        ...bookFormInput,
        publishedDate: '',
      });
    });
  });

  describe('transformBookFormInputToBookCreateInput', () => {
    beforeEach(() => {
      mockFindFormatOrThrow.mockReset();
      mockFindGenreOrThrow.mockReset();

      mockFindFormatOrThrow.mockReturnValue({ id: 2 });
      mockFindGenreOrThrow.mockReturnValue({ id: 3 });
    });

    it('should transform properly', () => {
      expect(
        transformBookFormInputToBookCreateInput({
          bookFormInput,
          quantity: '42',
          timezone: 'America/Chicago',
        }),
      ).toEqual({
        ...bookCreateInput,
        quantity: 42,
      });
    });

    it('should transform properly without quantity', () => {
      expect(
        transformBookFormInputToBookCreateInput({
          bookFormInput,
          timezone: 'America/Chicago',
        }),
      ).toEqual({
        ...bookCreateInput,
        quantity: 0,
      });
    });

    it('should throw error without formatId', () => {
      expect(() =>
        transformBookFormInputToBookCreateInput({
          bookFormInput: {
            ...bookFormInput,
            formatId: undefined,
          },
          timezone: 'America/Chicago',
        }),
      ).toThrowErrorMatchingInlineSnapshot(`"formatId required"`);
    });

    it('should throw error without genreId', () => {
      expect(() =>
        transformBookFormInputToBookCreateInput({
          bookFormInput: {
            ...bookFormInput,
            genreId: undefined,
          },
          timezone: 'America/Chicago',
        }),
      ).toThrowErrorMatchingInlineSnapshot(`"genreId required"`);
    });
  });
});
