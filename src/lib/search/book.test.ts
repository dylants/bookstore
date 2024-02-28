import { findBookByIsbn13 } from '@/lib/search/book';

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
      expect(mockTransformBookHydratedToBookFormInput).toHaveBeenCalledWith(
        'book',
        'zone',
      );
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
});
