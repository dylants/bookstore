import { GET } from '@/app/api/invoices/[id]/route';
import { fakeInvoice } from '@/lib/fakes/invoice';
import { NextRequest } from 'next/server';

const mockGetInvoice = jest.fn();
jest.mock('../../../../lib/actions/invoice', () => ({
  getInvoice: (...args: unknown[]) => mockGetInvoice(...args),
}));

function buildUrl(path: string): string {
  return `http://domain${path}`;
}
function buildInvoiceUrl(id: string): string {
  return buildUrl(`/api/invoice/${id}`);
}

describe('/api/invoice/[id]', () => {
  const invoice = fakeInvoice();
  const id = invoice.id;
  beforeEach(() => {
    mockGetInvoice.mockReset();
  });

  describe('GET', () => {
    it('should pass the correct values', async () => {
      mockGetInvoice.mockReturnValue({});

      const req = new NextRequest(new Request(buildInvoiceUrl(id.toString())), {
        method: 'GET',
      });
      const res = await GET(req, { params: { id } });

      expect(mockGetInvoice).toHaveBeenCalledWith(id);
      expect(res.status).toEqual(200);
    });

    it('should fail with non-number id', async () => {
      mockGetInvoice.mockReturnValue({});

      const req = new NextRequest(new Request(buildInvoiceUrl('hi')), {
        method: 'GET',
      });
      const res = await GET(req, { params: { id: 'hi' as unknown as number } });

      expect(res.status).toEqual(400);
      expect(res.statusText).toMatch(/Validation error: Expected number/);
    });

    it('should fail with not found', async () => {
      mockGetInvoice.mockReturnValue(null);

      const req = new NextRequest(new Request(buildInvoiceUrl(id.toString())), {
        method: 'GET',
      });
      const res = await GET(req, { params: { id } });

      expect(mockGetInvoice).toHaveBeenCalledWith(id);
      expect(res.status).toEqual(404);
    });
  });
});
