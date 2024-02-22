import { GET } from '@/app/api/invoices/[id]/invoice-items/route';
import { fakeInvoiceItem } from '@/lib/fakes/invoice-item';
import { NextRequest } from 'next/server';

const mockGetInvoiceItems = jest.fn();
jest.mock('../../../../../lib/actions/invoice-item', () => ({
  getInvoiceItems: (...args: unknown[]) => mockGetInvoiceItems(...args),
}));

function buildUrl(path: string): string {
  return `http://domain${path}`;
}
function buildInvoiceItemsUrl(invoiceId: number, query?: string): string {
  return buildUrl(
    `/api/invoices/${invoiceId}/invoice-items/${query ? `?${query}` : ''}`,
  );
}

describe('/api/invoices/[id]/invoice-items', () => {
  const invoice = fakeInvoiceItem();
  const id = invoice.id;
  beforeEach(() => {
    mockGetInvoiceItems.mockReset();
  });

  describe('GET', () => {
    it('should pass the correct values', async () => {
      mockGetInvoiceItems.mockReturnValue({});

      const req = new NextRequest(new Request(buildInvoiceItemsUrl(id)), {
        method: 'GET',
      });
      const res = await GET(req, { params: { id } });

      expect(mockGetInvoiceItems).toHaveBeenCalledWith({
        invoiceId: id,
        paginationQuery: {},
      });
      expect(res.status).toEqual(200);
    });

    it('should fail with non-number id', async () => {
      mockGetInvoiceItems.mockReturnValue({});

      const req = new NextRequest(
        new Request(buildInvoiceItemsUrl('hi' as unknown as number)),
        {
          method: 'GET',
        },
      );
      const res = await GET(req, { params: { id: 'hi' as unknown as number } });

      expect(res.status).toEqual(400);
      expect(res.statusText).toMatch(/Validation error: Expected number/);
    });

    it('should fail with not found', async () => {
      mockGetInvoiceItems.mockReturnValue(null);

      const req = new NextRequest(new Request(buildInvoiceItemsUrl(id)), {
        method: 'GET',
      });
      const res = await GET(req, { params: { id } });

      expect(mockGetInvoiceItems).toHaveBeenCalledWith({
        invoiceId: id,
        paginationQuery: {},
      });
      expect(res.status).toEqual(404);
    });
  });
});
