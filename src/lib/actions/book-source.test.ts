import { getBookSources } from '@/lib/actions/book-source';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { randomPublisher, randomVendor } from '@/lib/fakes/book-source';

describe('book actions', () => {
  const bookSource1 = randomVendor();
  const bookSource2 = randomPublisher();
  const bookSource3 = randomPublisher();

  describe('getBooks', () => {
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
  });
});
