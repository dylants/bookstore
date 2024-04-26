import { fakeBookHydrated } from '@/lib/fakes/book';
import { findBookByIsbn13, findBooksBySearchString } from '@/lib/search/book';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';

const mockGetBook = jest.fn();
jest.mock('../actions/book', () => ({
  getBook: (...args: unknown[]) => mockGetBook(...args),
}));

const mockTransformBookHydratedToBookFormInput = jest.fn();
jest.mock('../transformers/book', () => ({
  transformBookHydratedToBookFormInput: (...args: unknown[]) =>
    mockTransformBookHydratedToBookFormInput(...args),
}));

const mockGoogleBookSearch = jest.fn();
jest.mock('./google', () => ({
  googleBookSearch: (...args: unknown[]) => mockGoogleBookSearch(...args),
}));

describe('book search', () => {
  const book1 = fakeBookHydrated();
  const book2 = fakeBookHydrated();
  const book3 = fakeBookHydrated();

  beforeEach(() => {
    mockGetBook.mockReset();
    mockTransformBookHydratedToBookFormInput.mockReset();
  });

  describe('findBookByIsbn13', () => {
    it('should return hydrated book when found', async () => {
      mockGetBook.mockReturnValue('book');
      mockTransformBookHydratedToBookFormInput.mockReturnValue(
        'transformed book',
      );

      const result = await findBookByIsbn13({
        isbn13: '123',
        timezone: 'zone',
      });
      expect(mockTransformBookHydratedToBookFormInput).toHaveBeenCalledWith({
        bookHydrated: 'book',
        timezone: 'zone',
      });
      expect(mockGoogleBookSearch).not.toHaveBeenCalled();
      expect(result).toEqual('transformed book');
    });

    it('should return google search book when no internal book found', async () => {
      mockGetBook.mockReturnValue(null);
      mockGoogleBookSearch.mockReturnValue('google search book');

      const result = await findBookByIsbn13({
        isbn13: '123',
        timezone: 'zone',
      });
      expect(mockTransformBookHydratedToBookFormInput).not.toHaveBeenCalled();
      expect(mockGoogleBookSearch).toHaveBeenCalledWith({ isbn13: '123' });
      expect(result).toEqual('google search book');
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

    it('should process ISBN13', async () => {
      prismaMock.book.findMany.mockResolvedValue([book2]);

      const result = await findBooksBySearchString('9780765376671');

      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        include: {
          authors: true,
          format: true,
          genre: true,
          publisher: true,
        },
        where: {
          OR: [{ isbn13: { equals: 9780765376671 } }],
        },
      });
      expect(result).toEqual([book2]);
    });
  });
});
