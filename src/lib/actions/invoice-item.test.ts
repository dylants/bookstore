import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { createInvoiceItem } from '@/lib/actions/invoice-item';
import { fakeBook } from '@/lib/fakes/book';
import { fakeInvoice } from '@/lib/fakes/invoice';
import {
  fakeInvoiceItem,
  fakeInvoiceItemHydrated,
} from '@/lib/fakes/invoice-item';
import { computeTax } from '@/lib/money';

const mockUpsertBook = jest.fn();
jest.mock('./book', () => ({
  upsertBook: (...args: unknown[]) => mockUpsertBook(...args),
}));

describe('invoice-item actions', () => {
  const book = fakeBook();
  const invoice1 = fakeInvoice();
  const invoiceItem1 = fakeInvoiceItem({});
  const invoiceItemHydrated1 = fakeInvoiceItemHydrated({});
  beforeEach(() => {
    mockUpsertBook.mockReset();
  });

  describe('createInvoiceItem', () => {
    beforeEach(() => {
      mockUpsertBook.mockReturnValue(book);
    });

    it('should create a new invoice item', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      prismaMock.invoice.findUniqueOrThrow.mockResolvedValue(invoice1);
      prismaMock.invoice.update.mockResolvedValue(invoice1);
      invoiceItemHydrated1.invoiceId = invoice1.id;
      prismaMock.invoiceItem.create.mockResolvedValue(invoiceItemHydrated1);

      const result = await createInvoiceItem({
        book: {
          ...book,
          authors: 'author1',
          publisher: 'publisher2',
        },
        ...invoiceItem1,
      });

      expect(prismaMock.invoiceItem.create).toHaveBeenCalledWith({
        data: {
          book: {
            connect: { id: book.id },
          },
          invoice: {
            connect: { id: invoiceItem1.invoiceId },
          },
          itemCostInCents: invoiceItem1.itemCostInCents,
          productType: invoiceItem1.productType,
          quantity: invoiceItem1.quantity,
          totalCostInCents: invoiceItem1.totalCostInCents,
        },
        include: {
          book: {
            include: {
              authors: true,
              format: true,
              genre: true,
              publisher: true,
            },
          },
        },
      });

      const subTotalInCents =
        invoice1.subTotalInCents + invoiceItemHydrated1.totalCostInCents;
      const taxInCents = computeTax(subTotalInCents);
      const totalInCents = subTotalInCents + taxInCents;
      expect(prismaMock.invoice.update).toHaveBeenCalledWith({
        data: {
          subTotalInCents,
          taxInCents,
          totalInCents,
        },
        where: { id: invoice1.id },
      });

      expect(result).toEqual(invoiceItemHydrated1);
    });

    it('should throw error without book', async () => {
      await expect(
        createInvoiceItem(invoiceItem1),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Book required as input at this time"`,
      );
    });
  });
});
