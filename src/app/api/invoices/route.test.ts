import { GET } from '@/app/api/invoices/route';
import { NextRequest } from 'next/server';

const mockGetInvoices = jest.fn();
jest.mock('../../../lib/actions/invoice', () => ({
  getInvoices: (...args: unknown[]) => mockGetInvoices(...args),
}));

function buildUrl(path: string): string {
  return `http://domain${path}`;
}
function buildInvoicesUrl(query?: string): string {
  return buildUrl(`/api/invoices${query ? `?${query}` : ''}`);
}

describe('/api/invoices', () => {
  beforeEach(() => {
    mockGetInvoices.mockReset();
  });

  describe('GET', () => {
    it('should pass the correct values', async () => {
      mockGetInvoices.mockReturnValue({});

      const req = new NextRequest(new Request(buildInvoicesUrl()), {
        method: 'GET',
      });
      const res = await GET(req);

      expect(mockGetInvoices).toHaveBeenCalledWith({
        paginationQuery: {},
      });
      expect(res.status).toEqual(200);
    });

    it('error with invalid parameters', async () => {
      mockGetInvoices.mockReturnValue({});

      const req = new NextRequest(new Request(buildInvoicesUrl('first=hi')), {
        method: 'GET',
      });
      const res = await GET(req);

      expect(mockGetInvoices).not.toHaveBeenCalled();
      expect(res.status).toEqual(400);
      expect(res.statusText).toEqual(
        'Validation error: Expected number, received nan at "first"',
      );
    });
  });
});
