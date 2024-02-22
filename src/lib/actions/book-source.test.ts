import { getBookSources } from '@/lib/actions/book-source';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakePublisher, fakeVendor } from '@/lib/fakes/book-source';
import { buildPaginationRequest } from '@/lib/pagination';

jest.mock('../serializers/book-source', () => ({
  serializeBookSource: (vendor: unknown) => vendor,
}));

describe('book-source actions', () => {
  const bookSource1 = fakeVendor();
  const bookSource2 = fakePublisher();
  const bookSource3 = fakePublisher();

  describe('getBookSources', () => {
    it('should get book sources when provided with default input', async () => {
      prismaMock.bookSource.findMany.mockResolvedValue([
        bookSource1,
        bookSource2,
        bookSource3,
      ]);

      const result = await getBookSources({});

      expect(result).toEqual({
        bookSources: [bookSource1, bookSource2, bookSource3],
        pageInfo: {
          endCursor: bookSource3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: bookSource1.id.toString(),
        },
      });
    });

    it('should get book sources when provided with pagination query input', async () => {
      prismaMock.bookSource.findMany.mockResolvedValue([
        bookSource2,
        bookSource3,
      ]);

      const result = await getBookSources({
        paginationQuery: {
          after: '1',
          first: 2,
        },
      });

      expect(result).toEqual({
        bookSources: [bookSource2, bookSource3],
        pageInfo: {
          endCursor: bookSource3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: bookSource2.id.toString(),
        },
      });
    });

    it('should send correct input when provided with isPublisher', async () => {
      prismaMock.bookSource.findMany.mockResolvedValue([]);

      await getBookSources({ isPublisher: true });

      expect(prismaMock.bookSource.findMany).toHaveBeenCalledWith({
        ...buildPaginationRequest({}),
        where: { isPublisher: true },
      });
    });

    it('should send correct input when provided with isVendor', async () => {
      prismaMock.bookSource.findMany.mockResolvedValue([]);

      await getBookSources({ isVendor: true });

      expect(prismaMock.bookSource.findMany).toHaveBeenCalledWith({
        ...buildPaginationRequest({}),
        where: { isVendor: true },
      });
    });
  });
});
