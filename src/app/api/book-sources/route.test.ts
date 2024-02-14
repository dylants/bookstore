import { GET } from '@/app/api/book-sources/route';
import { NextRequest } from 'next/server';

const mockGetBookSources = jest.fn();
jest.mock('../../../lib/actions/book-source', () => ({
  getBookSources: (...args: unknown[]) => mockGetBookSources(...args),
}));

function buildUrl(path: string): string {
  return `http://domain${path}`;
}
function buildBookSourcesUrl(query?: string): string {
  return buildUrl(`/api/book-sources${query ? `?${query}` : ''}`);
}

describe('/api/book-sources', () => {
  beforeEach(() => {
    mockGetBookSources.mockReset();
  });

  describe('GET', () => {
    it('success with valid parameters', async () => {
      mockGetBookSources.mockReturnValue(['one', 'two']);

      const req = new NextRequest(new Request(buildBookSourcesUrl()), {
        method: 'GET',
      });
      const res = await GET(req);

      expect(mockGetBookSources).toHaveBeenCalledWith({
        paginationQuery: {},
      });
      expect(res.status).toEqual(200);
      expect(await res.json()).toEqual(['one', 'two']);
    });

    it('error with invalid parameters', async () => {
      mockGetBookSources.mockReturnValue({});

      const req = new NextRequest(
        new Request(buildBookSourcesUrl('first=hi')),
        {
          method: 'GET',
        },
      );
      const res = await GET(req);

      expect(mockGetBookSources).not.toHaveBeenCalled();
      expect(res.status).toEqual(400);
      expect(res.statusText).toEqual(
        'Validation error: Expected number, received nan at "first"',
      );
    });
  });
});
