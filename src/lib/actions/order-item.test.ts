import { createOrderItem, getOrderItems } from '@/lib/actions/order-item';
import { fakeOrderItem, fakeOrderItemHydrated } from '@/lib/fakes/order-item';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeBook } from '@/lib/fakes/book';
import { fakeOrder } from '@/lib/fakes/order';
import { computeTax } from '@/lib/money';
import { ProductType } from '@prisma/client';
import { buildPaginationRequest } from '@/lib/pagination';

describe('order item actions', () => {
  const order1 = fakeOrder();
  const orderItem1 = fakeOrderItem();
  const orderItemHydrated1 = fakeOrderItemHydrated();
  const orderItemHydrated2 = fakeOrderItemHydrated();
  const orderItemHydrated3 = fakeOrderItemHydrated();
  const book1 = fakeBook();

  describe('createOrderItem', () => {
    it('should create order item', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));
      prismaMock.book.findUniqueOrThrow.mockResolvedValue(book1);
      prismaMock.order.findUniqueOrThrow.mockResolvedValue(order1);
      prismaMock.order.update.mockResolvedValue(order1);
      orderItem1.orderId = order1.id;
      orderItem1.bookId = book1.id;
      prismaMock.orderItem.create.mockResolvedValue(orderItem1);

      await createOrderItem(orderItem1);

      expect(prismaMock.orderItem.create).toHaveBeenCalledWith({
        data: {
          book: {
            connect: { id: book1.id },
          },
          order: {
            connect: { id: order1.id },
          },
          productPriceInCents: book1.priceInCents,
          productType: ProductType.BOOK,
          quantity: orderItem1.quantity,
          totalPriceInCents: orderItem1.quantity * book1.priceInCents,
        },
      });

      const subTotalInCents =
        order1.subTotalInCents + orderItem1.totalPriceInCents;
      const taxInCents = computeTax(subTotalInCents);
      const totalInCents = subTotalInCents + taxInCents;
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        data: {
          subTotalInCents,
          taxInCents,
          totalInCents,
        },
        where: { id: order1.id },
      });
    });

    it('should throw error without book', async () => {
      await expect(
        createOrderItem({
          ...orderItem1,
          bookId: null,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"bookId required as input at this time"`,
      );
    });
  });

  describe('getOrderItems', () => {
    it('should get order items when provided with default input', async () => {
      prismaMock.orderItem.findMany.mockResolvedValue([
        orderItemHydrated1,
        orderItemHydrated2,
        orderItemHydrated3,
      ]);

      const result = await getOrderItems({});

      expect(prismaMock.orderItem.findMany).toHaveBeenCalledWith({
        ...buildPaginationRequest({}),
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
        where: { order: { orderUID: undefined } },
      });
      expect(result).toEqual({
        orderItems: [
          orderItemHydrated1,
          orderItemHydrated2,
          orderItemHydrated3,
        ],
        pageInfo: {
          endCursor: orderItemHydrated3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: orderItemHydrated1.id.toString(),
        },
      });
    });

    it('should get orders when provided with pagination query input', async () => {
      prismaMock.orderItem.findMany.mockResolvedValue([
        orderItemHydrated2,
        orderItemHydrated3,
      ]);

      const result = await getOrderItems({
        paginationQuery: {
          after: '1',
          first: 2,
        },
      });

      expect(result).toEqual({
        orderItems: [orderItemHydrated2, orderItemHydrated3],
        pageInfo: {
          endCursor: orderItemHydrated3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: orderItemHydrated2.id.toString(),
        },
      });
    });

    it('should pass correct values to prisma when provided with orderId', async () => {
      prismaMock.orderItem.findMany.mockResolvedValue([]);

      await getOrderItems({ orderUID: 'uid123' });

      expect(prismaMock.orderItem.findMany).toHaveBeenCalledWith({
        ...buildPaginationRequest({}),
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
        where: { order: { orderUID: 'uid123' } },
      });
    });

    it('should process non-book product type order items', async () => {
      prismaMock.orderItem.findMany.mockResolvedValue([
        orderItemHydrated1,
        orderItemHydrated2,
        {
          ...orderItemHydrated3,
          productType: 'foo' as ProductType,
        },
      ]);

      const result = await getOrderItems({});

      expect(result).toEqual({
        orderItems: [
          orderItemHydrated1,
          orderItemHydrated2,
          {
            ...orderItemHydrated3,
            book: undefined,
            bookId: null,
            productType: 'foo',
          },
        ],
        pageInfo: {
          endCursor: orderItemHydrated3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: orderItemHydrated1.id.toString(),
        },
      });
    });
  });
});
