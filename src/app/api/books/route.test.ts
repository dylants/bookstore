import { GET } from '@/app/api/books/route';
import { NextRequest } from 'next/server';

const mockGetBooks = jest.fn();
jest.mock('../../../lib/actions/book', () => ({
  getBooks: (...args: unknown[]) => mockGetBooks(...args),
}));

function buildUrl(path: string): string {
  return `http://domain${path}`;
}
function buildBooksUrl(query?: string): string {
  return buildUrl(`/api/books${query ? `?${query}` : ''}`);
}

describe('/api/books', () => {
  beforeEach(() => {
    mockGetBooks.mockReset();
  });

  describe('GET', () => {
    it('success with 0 search parameters', async () => {
      mockGetBooks.mockReturnValue({});

      const req = new NextRequest(new Request(buildBooksUrl()), {
        method: 'GET',
      });
      const res = await GET(req);

      expect(mockGetBooks).toHaveBeenCalledWith({
        paginationQuery: {},
      });
      expect(res.status).toEqual(200);
    });

    it('success with 1 search parameter', async () => {
      mockGetBooks.mockReturnValue({});

      const req = new NextRequest(new Request(buildBooksUrl('first=1')), {
        method: 'GET',
      });
      const res = await GET(req);

      expect(mockGetBooks).toHaveBeenCalledWith({
        paginationQuery: {
          first: 1,
        },
      });
      expect(res.status).toEqual(200);
    });

    it('success with 2 search parameters', async () => {
      mockGetBooks.mockReturnValue({});

      const req = new NextRequest(
        new Request(buildBooksUrl('first=1&after=2')),
        {
          method: 'GET',
        },
      );
      const res = await GET(req);

      expect(mockGetBooks).toHaveBeenCalledWith({
        paginationQuery: {
          after: '2',
          first: 1,
        },
      });
      expect(res.status).toEqual(200);
    });

    it('error with invalid parameters', async () => {
      mockGetBooks.mockReturnValue({});

      const req = new NextRequest(new Request(buildBooksUrl('first=hi')), {
        method: 'GET',
      });
      const res = await GET(req);

      expect(mockGetBooks).not.toHaveBeenCalled();
      expect(res.status).toEqual(400);
      expect(res.statusText).toEqual(
        'Validation error: Expected number, received nan at "first"',
      );
    });
  });
});
