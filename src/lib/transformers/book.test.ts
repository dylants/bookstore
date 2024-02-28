import { fakeAuthor } from '@/lib/fakes/author';
import { fakePublisherSerialized } from '@/lib/fakes/book-source';
import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { transformBookHydratedToBookFormInput } from '@/lib/transformers/book';
import BookFormInput from '@/types/BookFormInput';
import BookHydrated from '@/types/BookHydrated';
import { Format, Genre } from '@prisma/client';

describe('book transformers', () => {
  describe('transformBookHydratedToBookFormInput', () => {
    const date = new Date('2000-01-02T06:00:00.000Z');
    const bookHydrated: BookHydrated = {
      ...fakeCreatedAtUpdatedAt(),
      authors: [
        { ...fakeAuthor(), name: 'Author 1' },
        { ...fakeAuthor(), name: 'Author 2' },
      ],
      format: Format.TRADE_PAPERBACK,
      genre: Genre.FANTASY,
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
      format: 'TRADE_PAPERBACK',
      genre: 'FANTASY',
      imageUrl: 'http://image.com',
      isbn13: '987',
      priceInCents: '19.99',
      publishedDate: '2000-01-02',
      publisher: 'Publisher 1',
      quantity: '12',
      title: 'My Book',
    };

    it('should work with a fully populated book', () => {
      expect(
        transformBookHydratedToBookFormInput(bookHydrated, 'America/Chicago'),
      ).toEqual(bookFormInput);
    });

    it('should work with a book without optional fields', () => {
      expect(
        transformBookHydratedToBookFormInput(
          {
            ...bookHydrated,
            publishedDate: null,
          },
          'America/Chicago',
        ),
      ).toEqual({
        ...bookFormInput,
        publishedDate: '',
      });
    });
  });
});
