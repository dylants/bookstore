import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { createInvoiceItem, getInvoiceItems } from '@/lib/actions/invoice-item';
import { fakeBook } from '@/lib/fakes/book';
import {
  fakeInvoiceItem,
  fakeInvoiceItemHydrated,
} from '@/lib/fakes/invoice-item';
import { buildPaginationRequest } from '@/lib/pagination';
import { ProductType } from '@prisma/client';

const mockUpsertBook = jest.fn();
jest.mock('./book', () => ({
  upsertBook: (...args: unknown[]) => mockUpsertBook(...args),
}));

describe('invoice-item actions', () => {
  const book = fakeBook();
  const invoiceItem1 = fakeInvoiceItem();
  const invoiceItemHydrated1 = fakeInvoiceItemHydrated();
  const invoiceItemHydrated2 = fakeInvoiceItemHydrated();
  const invoiceItemHydrated3 = fakeInvoiceItemHydrated();
  beforeEach(() => {
    mockUpsertBook.mockReset();
  });

  describe('createInvoiceItem', () => {
    beforeEach(() => {
      mockUpsertBook.mockReturnValue(book);
    });

    it('should create a new invoice item', async () => {
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
              publisher: true,
            },
          },
        },
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

  describe('getInvoiceItems', () => {
    it('should get invoice items when provided with default input', async () => {
      prismaMock.invoiceItem.findMany.mockResolvedValue([
        invoiceItemHydrated1,
        invoiceItemHydrated2,
        invoiceItemHydrated3,
      ]);

      const result = await getInvoiceItems({});

      expect(prismaMock.invoiceItem.findMany).toHaveBeenCalledWith({
        ...buildPaginationRequest({}),
        include: {
          book: {
            include: {
              authors: true,
              publisher: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        where: {},
      });
      expect(result).toEqual({
        invoiceItems: [
          invoiceItemHydrated1,
          invoiceItemHydrated2,
          invoiceItemHydrated3,
        ],
        pageInfo: {
          endCursor: invoiceItemHydrated3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: invoiceItemHydrated1.id.toString(),
        },
      });
    });

    it('should get invoices when provided with pagination query input', async () => {
      prismaMock.invoiceItem.findMany.mockResolvedValue([
        invoiceItemHydrated2,
        invoiceItemHydrated3,
      ]);

      const result = await getInvoiceItems({
        paginationQuery: {
          after: '1',
          first: 2,
        },
      });

      expect(result).toEqual({
        invoiceItems: [invoiceItemHydrated2, invoiceItemHydrated3],
        pageInfo: {
          endCursor: invoiceItemHydrated3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: invoiceItemHydrated2.id.toString(),
        },
      });
    });

    it('should pass correct values to prisma when provided with invoiceId', async () => {
      prismaMock.invoiceItem.findMany.mockResolvedValue([]);

      await getInvoiceItems({ invoiceId: 123 });

      expect(prismaMock.invoiceItem.findMany).toHaveBeenCalledWith({
        ...buildPaginationRequest({}),
        include: {
          book: {
            include: {
              authors: true,
              publisher: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        where: { invoiceId: 123 },
      });
    });

    it('should process non-book product type invoice items', async () => {
      prismaMock.invoiceItem.findMany.mockResolvedValue([
        invoiceItemHydrated1,
        invoiceItemHydrated2,
        {
          ...invoiceItemHydrated3,
          productType: 'foo' as ProductType,
        },
      ]);

      const result = await getInvoiceItems({});

      expect(result).toEqual({
        invoiceItems: [
          invoiceItemHydrated1,
          invoiceItemHydrated2,
          {
            ...invoiceItemHydrated3,
            book: undefined,
            bookId: null,
            productType: 'foo',
          },
        ],
        pageInfo: {
          endCursor: invoiceItemHydrated3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: invoiceItemHydrated1.id.toString(),
        },
      });
    });
  });
});
