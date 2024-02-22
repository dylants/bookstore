import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { createInvoiceItem } from '@/lib/actions/invoice-item';
import { fakeBook } from '@/lib/fakes/book';
import {
  fakeInvoiceItem,
  fakeInvoiceItemHydrated,
} from '@/lib/fakes/invoice-item';

const mockUpsertBook = jest.fn();
jest.mock('./book', () => ({
  upsertBook: (...args: unknown[]) => mockUpsertBook(...args),
}));

describe('invoice-item actions', () => {
  const book = fakeBook();
  const invoiceItem = fakeInvoiceItem();
  const invoiceItemHydrated = fakeInvoiceItemHydrated();
  beforeEach(() => {
    mockUpsertBook.mockReset();
  });

  describe('createInvoiceItem', () => {
    beforeEach(() => {
      mockUpsertBook.mockReturnValue(book);
    });

    it('should create a new invoice item', async () => {
      prismaMock.invoiceItem.create.mockResolvedValue(invoiceItemHydrated);

      const result = await createInvoiceItem({
        book: {
          ...book,
          authors: 'author1',
          publisher: 'publisher2',
        },
        ...invoiceItem,
      });

      expect(prismaMock.invoiceItem.create).toHaveBeenCalledWith({
        data: {
          book: {
            connect: { id: book.id },
          },
          invoice: {
            connect: { id: invoiceItem.invoiceId },
          },
          itemCostInCents: invoiceItem.itemCostInCents,
          quantity: invoiceItem.quantity,
          totalCostInCents: invoiceItem.totalCostInCents,
        },
        include: {
          book: {
            include: {
              authors: true,
              publisher: true,
            },
          },
          invoice: true,
        },
      });

      expect(result).toEqual(invoiceItemHydrated);
    });
  });
});
