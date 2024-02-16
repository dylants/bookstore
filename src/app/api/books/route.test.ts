import { GET, POST } from '@/app/api/books/route';
import { randomBook } from '@/lib/fakes/book';
import { NextRequest } from 'next/server';

const mockCreateBook = jest.fn();
const mockGetBooks = jest.fn();
jest.mock('../../../lib/actions/book', () => ({
  createBook: (...args: unknown[]) => mockCreateBook(...args),
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
    mockCreateBook.mockReset();
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

  describe('POST', () => {
    const book = randomBook();
    const serializableBook = {
      ...book,
      isbn13: book.isbn13.toString(),
    };
    const validPostBody = {
      ...serializableBook,
      authors: 'Some Author',
      publisher: 'A Publisher',
    };

    beforeEach(() => {
      mockCreateBook.mockReturnValue(serializableBook);
    });

    it('should return the created book with valid input', async () => {
      const req = new NextRequest(new Request(buildBooksUrl()), {
        body: JSON.stringify(validPostBody),
        method: 'POST',
      });
      const res = await POST(req);

      expect(res.status).toEqual(200);
    });

    it('should fail with missing params', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { title, ...rest } = validPostBody;
      const req = new NextRequest(new Request(buildBooksUrl()), {
        body: JSON.stringify(rest),
        method: 'POST',
      });
      const res = await POST(req);

      expect(res.status).toEqual(400);
      expect(res.statusText).toEqual('Validation error: Required at "title"');
    });

    it('should fail with invalid format', async () => {
      const req = new NextRequest(new Request(buildBooksUrl()), {
        body: JSON.stringify({
          ...validPostBody,
          format: 'hello',
        }),
        method: 'POST',
      });
      const res = await POST(req);

      expect(res.status).toEqual(400);
      expect(res.statusText).toMatch(/Validation error: Invalid enum value/);
    });

    it('should fail with invalid genre', async () => {
      const req = new NextRequest(new Request(buildBooksUrl()), {
        body: JSON.stringify({
          ...validPostBody,
          genre: 'hello',
        }),
        method: 'POST',
      });
      const res = await POST(req);

      expect(res.status).toEqual(400);
      expect(res.statusText).toMatch(/Validation error: Invalid enum value/);
    });

    it('should fail with invalid isbn13', async () => {
      const req = new NextRequest(new Request(buildBooksUrl()), {
        body: JSON.stringify({
          ...validPostBody,
          isbn13: 'hello',
        }),
        method: 'POST',
      });
      const res = await POST(req);

      expect(res.status).toEqual(400);
      expect(res.statusText).toEqual(
        'Validation error: Expected bigint, received string at "isbn13"',
      );
    });

    it('should fail with invalid publishedDate', async () => {
      const req = new NextRequest(new Request(buildBooksUrl()), {
        body: JSON.stringify({
          ...validPostBody,
          publishedDate: 'hello',
        }),
        method: 'POST',
      });
      const res = await POST(req);

      expect(res.status).toEqual(400);
      expect(res.statusText).toEqual(
        'Validation error: Invalid date at "publishedDate"',
      );
    });
  });
});
