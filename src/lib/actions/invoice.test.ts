import { fakeInvoice } from '@/lib/fakes/invoice';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { completeInvoice, createInvoice } from '@/lib/actions/invoice';
import { fakeInvoiceItem } from '@/lib/fakes/invoice-item';
import { randomBook } from '@/lib/fakes/book';

describe('invoice actions', () => {
  const invoice = fakeInvoice(false);

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2000-02-03T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

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

  describe('completeInvoice', () => {
    it('should complete the invoice', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      const item1 = fakeInvoiceItem();
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce({
        ...randomBook(),
        quantity: 7,
      });
      const item2 = fakeInvoiceItem();
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce({
        ...randomBook(),
        quantity: 0,
      });
      const item3 = fakeInvoiceItem();
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce({
        ...randomBook(),
        quantity: 2,
      });
      prismaMock.invoiceItem.findMany.mockResolvedValue([item1, item2, item3]);
      prismaMock.invoice.update.mockResolvedValue(invoice);

      const result = await completeInvoice(invoice.id);

      expect(prismaMock.invoiceItem.findMany).toHaveBeenCalledWith({
        where: { invoiceId: invoice.id },
      });

      expect(prismaMock.book.update).toHaveBeenCalledTimes(3);
      expect(prismaMock.book.update).toHaveBeenNthCalledWith(1, {
        data: { quantity: item1.quantity + 7 },
        where: { id: item1.bookId },
      });
      expect(prismaMock.book.update).toHaveBeenNthCalledWith(2, {
        data: { quantity: item2.quantity + 0 },
        where: { id: item2.bookId },
      });
      expect(prismaMock.book.update).toHaveBeenNthCalledWith(3, {
        data: { quantity: item3.quantity + 2 },
        where: { id: item3.bookId },
      });

      expect(prismaMock.invoice.update).toHaveBeenCalledWith({
        data: {
          dateReceived: new Date('2000-02-03T12:00:00.000Z'),
          isCompleted: true,
        },
        include: {
          invoiceItems: true,
          vendor: true,
        },
        where: { id: invoice.id },
      });

      expect(result).toEqual(invoice);
    });
  });
});
