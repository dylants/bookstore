import { fakeInvoice } from '@/lib/fakes/invoice';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import {
  completeInvoice,
  createInvoice,
  getInvoice,
  getInvoices,
} from '@/lib/actions/invoice';
import { fakeInvoiceItem } from '@/lib/fakes/invoice-item';
import { fakeBook } from '@/lib/fakes/book';
import { Invoice } from '@prisma/client';

jest.mock('../serializers/book-source', () => ({
  serializeBookSource: (vendor: unknown) => vendor,
}));

describe('invoice actions', () => {
  const invoice1 = fakeInvoice(false);
  const resolvedInvoice1 = {
    ...invoice1,
    _count: { invoiceItems: 3 },
  } as Invoice;
  const invoice2 = fakeInvoice(true);
  const resolvedInvoice2 = {
    ...invoice2,
    _count: { invoiceItems: 8 },
  } as Invoice;
  const invoice3 = fakeInvoice(false);
  const resolvedInvoice3 = {
    ...invoice3,
    _count: { invoiceItems: 0 },
  } as Invoice;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2000-02-03T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      prismaMock.invoice.create.mockResolvedValue(invoice1);

      const result = await createInvoice(invoice1);

      expect(prismaMock.invoice.create).toHaveBeenCalledWith({
        data: {
          invoiceDate: invoice1.invoiceDate,
          invoiceNumber: invoice1.invoiceNumber,
          vendorId: invoice1.vendorId,
        },
        include: {
          vendor: true,
        },
      });

      expect(result).toEqual({
        ...invoice1,
        numInvoiceItems: 0,
      });
    });
  });

  describe('completeInvoice', () => {
    it('should complete the invoice', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      const item1 = fakeInvoiceItem();
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce({
        ...fakeBook(),
        quantity: 7,
      });
      const item2 = fakeInvoiceItem();
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce({
        ...fakeBook(),
        quantity: 0,
      });
      const item3 = fakeInvoiceItem();
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce({
        ...fakeBook(),
        quantity: 2,
      });
      prismaMock.invoiceItem.findMany.mockResolvedValue([item1, item2, item3]);
      prismaMock.invoice.update.mockResolvedValue(resolvedInvoice1);

      const result = await completeInvoice(invoice1.id);

      expect(prismaMock.invoiceItem.findMany).toHaveBeenCalledWith({
        where: { invoiceId: invoice1.id },
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
          _count: {
            select: { invoiceItems: true },
          },
          vendor: true,
        },
        where: { id: invoice1.id },
      });

      expect(result).toEqual({
        ...invoice1,
        _count: { invoiceItems: 3 },
        numInvoiceItems: 3,
      });
    });
  });

  describe('getInvoices', () => {
    it('should get invoices when provided with default input', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([
        resolvedInvoice1,
        resolvedInvoice2,
        resolvedInvoice3,
      ]);

      const result = await getInvoices({});

      expect(result).toEqual({
        invoices: [
          {
            ...resolvedInvoice1,
            numInvoiceItems: 3,
          },
          {
            ...resolvedInvoice2,
            numInvoiceItems: 8,
          },
          {
            ...resolvedInvoice3,
            numInvoiceItems: 0,
          },
        ],
        pageInfo: {
          endCursor: invoice3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: invoice1.id.toString(),
        },
      });
    });

    it('should get invoices when provided with pagination query input', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([
        resolvedInvoice2,
        resolvedInvoice3,
      ]);

      const result = await getInvoices({
        paginationQuery: {
          after: '1',
          first: 2,
        },
      });

      expect(result).toEqual({
        invoices: [
          {
            ...resolvedInvoice2,
            numInvoiceItems: 8,
          },
          {
            ...resolvedInvoice3,
            numInvoiceItems: 0,
          },
        ],
        pageInfo: {
          endCursor: invoice3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: invoice2.id.toString(),
        },
      });
    });
  });

  describe('getInvoice', () => {
    it('should provide the correct input to prisma', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(resolvedInvoice1);

      const result = await getInvoice(1);

      expect(prismaMock.invoice.findUnique).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { invoiceItems: true },
          },
          vendor: true,
        },
        where: { id: 1 },
      });
      expect(result).toEqual({
        ...resolvedInvoice1,
        numInvoiceItems: 3,
      });
    });
  });
});
