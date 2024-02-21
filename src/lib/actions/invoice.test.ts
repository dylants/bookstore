import { fakeInvoice } from '@/lib/fakes/invoice';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { createInvoice } from '@/lib/actions/invoice';

describe('invoice actions', () => {
  const invoice = fakeInvoice();

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      prismaMock.invoice.create.mockResolvedValue(invoice);

      const result = await createInvoice(invoice);

      expect(prismaMock.invoice.create).toHaveBeenCalledWith({
        data: {
          invoiceDate: invoice.invoiceDate,
          invoiceNumber: invoice.invoiceNumber,
          vendorId: invoice.vendorId,
        },
        include: {
          invoiceItems: true,
          vendor: true,
        },
      });

      expect(result).toEqual(invoice);
    });
  });
});
