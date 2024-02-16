import { GET, PUT } from '@/app/api/books/[isbn]/route';
import { randomBook } from '@/lib/fakes/book';
import { NextRequest } from 'next/server';

const mockGetBook = jest.fn();
const mockUpsertBook = jest.fn();
jest.mock('../../../../lib/actions/book', () => ({
  getBook: (...args: unknown[]) => mockGetBook(...args),
  upsertBook: (...args: unknown[]) => mockUpsertBook(...args),
}));

function buildUrl(path: string): string {
  return `http://domain${path}`;
}
function buildBooksUrl(isbn: string): string {
  return buildUrl(`/api/books/${isbn}`);
}

describe('/api/books/[isbn]', () => {
  const book = randomBook();
  const isbn = book.isbn13.toString();
  beforeEach(() => {
    mockGetBook.mockReset();
    mockUpsertBook.mockReset();
  });

  describe('GET', () => {
    it('should pass the correct values', async () => {
      mockGetBook.mockReturnValue({});

      const req = new NextRequest(new Request(buildBooksUrl(isbn)), {
        method: 'GET',
      });
      const res = await GET(req, { params: { isbn } });

      expect(mockGetBook).toHaveBeenCalledWith(BigInt(isbn));
      expect(res.status).toEqual(200);
    });
  });

  describe('PUT', () => {
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
      mockUpsertBook.mockReturnValue(serializableBook);
    });

    it('should return the created book with valid input', async () => {
      const req = new NextRequest(new Request(buildBooksUrl(isbn)), {
        body: JSON.stringify(validPostBody),
        method: 'PUT',
      });
      const res = await PUT(req, { params: { isbn } });

      expect(mockUpsertBook).toHaveBeenCalledWith({
        ...validPostBody,
        createdAt: book.createdAt?.toISOString(),
        publishedDate: book.publishedDate?.toISOString(),
        updatedAt: book.updatedAt?.toISOString(),
      });
      expect(res.status).toEqual(200);
    });

    it('should fail with missing params', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { title, ...rest } = validPostBody;
      const req = new NextRequest(new Request(buildBooksUrl(isbn)), {
        body: JSON.stringify(rest),
        method: 'PUT',
      });
      const res = await PUT(req, { params: { isbn } });

      expect(res.status).toEqual(400);
      expect(res.statusText).toEqual('Validation error: Required at "title"');
    });

    it('should fail with invalid isbn13', async () => {
      const req = new NextRequest(new Request(buildBooksUrl('hi')), {
        body: JSON.stringify(validPostBody),
        method: 'PUT',
      });
      const res = await PUT(req, { params: { isbn: 'hi' } });

      expect(res.status).toEqual(400);
      expect(res.statusText).toEqual(
        'Validation error: Expected bigint, received string at "isbn13"',
      );
    });
  });
});
