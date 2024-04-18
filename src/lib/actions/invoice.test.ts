import { fakeInvoice } from '@/lib/fakes/invoice';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import {
  completeInvoice,
  createInvoice,
  getInvoiceWithItems,
  getInvoices,
} from '@/lib/actions/invoice';
import {
  fakeInvoiceItem,
  fakeInvoiceItemHydrated,
} from '@/lib/fakes/invoice-item';
import { fakeBook } from '@/lib/fakes/book';
import { Invoice, ProductType } from '@prisma/client';
import { buildPaginationRequest } from '@/lib/pagination';

jest.mock('../serializers/book-source', () => ({
  serializeBookSource: () => undefined,
}));

describe('invoice actions', () => {
  const invoice1 = fakeInvoice(false);
  const resolvedInvoice1 = {
    ...invoice1,
    invoiceItems: [fakeInvoiceItem({ quantity: 3 })],
  } as Invoice;
  const invoice2 = fakeInvoice(true);
  const resolvedInvoice2 = {
    ...invoice2,
    invoiceItems: [fakeInvoiceItem({ quantity: 8 })],
  } as Invoice;
  const invoice3 = fakeInvoice(false);
  const resolvedInvoice3 = {
    ...invoice3,
    invoiceItems: [fakeInvoiceItem({ quantity: 0 })],
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
          subTotalInCents: 0,
          taxInCents: 0,
          totalInCents: 0,
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

      const book1 = fakeBook();
      book1.quantity = 7;
      const item1 = fakeInvoiceItem({ quantity: 5 });
      item1.bookId = book1.id;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      const book2 = fakeBook();
      book2.quantity = 0;
      const item2 = fakeInvoiceItem({ quantity: 3 });
      item2.bookId = book2.id;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book2);

      const item3 = fakeInvoiceItem({ quantity: 1 });
      // item3 has same bookId as item1
      item3.bookId = book1.id;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      prismaMock.invoiceItem.findMany.mockResolvedValue([item1, item2, item3]);
      prismaMock.invoice.update.mockResolvedValue(resolvedInvoice1);

      const result = await completeInvoice(invoice1.id);

      expect(prismaMock.invoiceItem.findMany).toHaveBeenCalledWith({
        where: { invoiceId: invoice1.id },
      });

      // 3 invoice items, but only 2 books total
      expect(prismaMock.book.update).toHaveBeenCalledTimes(2);
      expect(prismaMock.book.update).toHaveBeenNthCalledWith(1, {
        // book1 + item1 + item3
        data: { quantity: 7 + 5 + 1 },
        where: { id: item1.bookId },
      });
      expect(prismaMock.book.update).toHaveBeenNthCalledWith(2, {
        // book2 + item2
        data: { quantity: 0 + 3 },
        where: { id: item2.bookId },
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
        where: { id: invoice1.id },
      });

      expect(result).toEqual({
        ...invoice1,
        numInvoiceItems: 3,
      });
    });

    it('should skip updating books for non-book product types', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      const book1 = fakeBook();
      const item1 = fakeInvoiceItem({});
      item1.bookId = book1.id;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      const item2 = fakeInvoiceItem({});
      // item2 is not a BOOK product type
      item2.productType = 'foo' as ProductType;
      item2.bookId = null;

      prismaMock.invoiceItem.findMany.mockResolvedValue([item1, item2]);
      prismaMock.invoice.update.mockResolvedValue(resolvedInvoice1);

      await completeInvoice(invoice1.id);

      // 2 invoice items, but only 1 of type book
      expect(prismaMock.book.update).toHaveBeenCalledTimes(1);
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

      expect(prismaMock.invoice.findMany).toHaveBeenCalledWith({
        ...buildPaginationRequest({}),
        include: {
          invoiceItems: true,
          vendor: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        invoices: [
          {
            ...invoice1,
            numInvoiceItems: 3,
          },
          {
            ...invoice2,
            numInvoiceItems: 8,
          },
          {
            ...invoice3,
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
            ...invoice2,
            numInvoiceItems: 8,
          },
          {
            ...invoice3,
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

  describe('getInvoiceWithItems', () => {
    it('should provide the correct input to prisma', async () => {
      const invoice = fakeInvoice(false);
      const invoiceItemHydrated1 = fakeInvoiceItemHydrated({ quantity: 2 });
      const invoiceItemHydrated2 = fakeInvoiceItemHydrated({ quantity: 3 });

      prismaMock.invoice.findUnique.mockResolvedValue({
        ...invoice,
        invoiceItems: [
          invoiceItemHydrated1,
          {
            ...invoiceItemHydrated2,
            productType: 'foo',
          },
        ],
      } as Invoice);

      const result = await getInvoiceWithItems(1);

      expect(prismaMock.invoice.findUnique).toHaveBeenCalledWith({
        include: {
          invoiceItems: {
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
            orderBy: { createdAt: 'desc' },
          },
          vendor: true,
        },
        where: { id: 1 },
      });
      expect(result).toEqual({
        ...invoice,
        invoiceItems: [
          invoiceItemHydrated1,
          {
            ...invoiceItemHydrated2,
            book: undefined,
            bookId: null,
            productType: 'foo',
          },
        ],
        numInvoiceItems: 5,
      });
    });

    it('should return null when no invoice exists', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(null);
      const result = await getInvoiceWithItems(1);
      expect(result).toEqual(null);
    });
  });
});
