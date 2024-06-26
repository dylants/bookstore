import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrderWithItems,
  getOrders,
  moveOrderToOpenOrThrow,
  moveOrderToPaidOrThrow,
  moveOrderToPendingTransactionOrThrow,
} from '@/lib/actions/order';
import { Order, OrderState, ProductType } from '@prisma/client';
import { fakeOrder } from '@/lib/fakes/order';
import { fakeOrderItem, fakeOrderItemHydrated } from '@/lib/fakes/order-item';
import { fakeBook } from '@/lib/fakes/book';
import BadRequestError from '@/lib/errors/BadRequestError';
import { buildPaginationRequest } from '@/lib/pagination';
import OrderWithItemsHydrated from '@/types/OrderWithItemsHydrated';

describe('order action', () => {
  const order1 = fakeOrder();
  const resolvedOrder1 = {
    ...order1,
    _count: { orderItems: 3 },
  } as Order;
  const order2 = fakeOrder();
  const resolvedOrder2 = {
    ...order2,
    _count: { orderItems: 8 },
  } as Order;
  const order3 = fakeOrder();
  const resolvedOrder3 = {
    ...order3,
    _count: { orderItems: 0 },
  } as Order;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2021-02-03T12:13:14.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      prismaMock.order.create.mockResolvedValue(order1);
      prismaMock.order.update.mockResolvedValue(order1);

      const result = await createOrder();

      expect(prismaMock.order.create).toHaveBeenCalledWith({
        data: {
          orderOpenedDate: new Date('2021-02-03T12:13:14.000Z'),
          orderState: OrderState.OPEN,
          subTotalInCents: 0,
          taxInCents: 0,
          totalInCents: 0,
        },
      });
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        data: { orderUID: `210203121314-${order1.id}` },
        where: { id: order1.id },
      });

      expect(result).toEqual({
        ...order1,
        orderItems: [],
      });
    });
  });

  describe('moveOrderToPendingTransactionOrThrow', () => {
    it('should move the order to PENDING_TRANSACTION', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      const book1 = fakeBook();
      book1.quantity = 7;
      const item1 = fakeOrderItem();
      item1.bookId = book1.id;
      item1.quantity = 5;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      const book2 = fakeBook();
      book2.quantity = 3;
      const item2 = fakeOrderItem();
      item2.bookId = book2.id;
      item2.quantity = 3;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book2);

      const item3 = fakeOrderItem();
      // item3 has same bookId as item1
      item3.bookId = book1.id;
      item3.quantity = 1;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      const order = {
        ...order1,
        orderItems: [item1, item2, item3],
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);
      prismaMock.order.update.mockResolvedValue(order);

      await moveOrderToPendingTransactionOrThrow({
        orderUID: order.orderUID,
        tx: prismaMock,
      });

      expect(prismaMock.order.findFirstOrThrow).toHaveBeenCalledWith({
        include: { orderItems: true },
        where: { orderUID: order.orderUID },
      });

      // 3 order items, but only 2 books total
      expect(prismaMock.book.update).toHaveBeenCalledTimes(2);
      expect(prismaMock.book.update).toHaveBeenNthCalledWith(1, {
        // book1 - item1 - item3
        data: { quantity: 7 - 5 - 1 },
        where: { id: item1.bookId },
      });
      expect(prismaMock.book.update).toHaveBeenNthCalledWith(2, {
        // book2 - item2
        data: { quantity: 3 - 3 },
        where: { id: item2.bookId },
      });

      expect(prismaMock.order.update).toHaveBeenCalledWith({
        data: {
          orderState: OrderState.PENDING_TRANSACTION,
        },
        where: { orderUID: order.orderUID },
      });
    });

    it('should skip updating books for non-book product types', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      const book1 = fakeBook();
      book1.quantity = 7;
      const item1 = fakeOrderItem();
      item1.bookId = book1.id;
      item1.quantity = 5;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      const item2 = fakeOrderItem();
      // item2 is not a BOOK product type
      item2.productType = 'foo' as ProductType;
      item2.bookId = null;

      const order = {
        ...order1,
        orderItems: [item1, item2],
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);
      prismaMock.order.update.mockResolvedValue(order);

      await moveOrderToPendingTransactionOrThrow({
        orderUID: order.orderUID,
        tx: prismaMock,
      });

      // 2 order items, but only 1 of type book
      expect(prismaMock.book.update).toHaveBeenCalledTimes(1);
    });

    it('should allow for negative inventory quantity', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      const book1 = fakeBook();
      book1.quantity = 1;
      const item1 = fakeOrderItem();
      item1.bookId = book1.id;
      // 2 is more than 1
      item1.quantity = 2;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      const order = {
        ...order1,
        orderItems: [item1],
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);
      prismaMock.order.update.mockResolvedValue(order);

      await moveOrderToPendingTransactionOrThrow({
        orderUID: order.orderUID,
        tx: prismaMock,
      });

      expect(prismaMock.book.update).toHaveBeenCalledWith({
        data: { quantity: -1 },
        where: { id: item1.bookId },
      });

      expect(prismaMock.order.update).toHaveBeenCalledWith({
        data: {
          orderState: OrderState.PENDING_TRANSACTION,
        },
        where: { orderUID: order.orderUID },
      });
    });

    it('should throw BadRequestError when attempting to move order not in OPEN state', async () => {
      const order = {
        ...order1,
        orderState: OrderState.PAID,
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);

      expect.assertions(2);
      try {
        await moveOrderToPendingTransactionOrThrow({
          orderUID: order.orderUID,
          tx: prismaMock,
        });
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
        const error: BadRequestError = err as BadRequestError;
        expect(error.message).toEqual(
          'Order state must be in OPEN state to move to PENDING_TRANSACTION',
        );
      }
    });
  });

  describe('moveOrderToPaidOrThrow', () => {
    it('should return the order to OPEN state', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      const order = {
        ...order1,
        orderState: OrderState.PENDING_TRANSACTION,
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);
      prismaMock.order.update.mockResolvedValue(order);

      await moveOrderToPaidOrThrow({
        orderUID: order.orderUID,
        tx: prismaMock,
      });

      expect(prismaMock.order.findFirstOrThrow).toHaveBeenCalledWith({
        where: { orderUID: order.orderUID },
      });

      expect(prismaMock.order.update).toHaveBeenCalledWith({
        data: {
          orderClosedDate: new Date('2021-02-03T12:13:14.000Z'),
          orderState: OrderState.PAID,
        },
        where: { orderUID: order.orderUID },
      });
    });

    it('should throw BadRequestError when attempting to move order not in PENDING_TRANSACTION state', async () => {
      const order = {
        ...order1,
        orderState: OrderState.PAID,
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);

      expect.assertions(2);
      try {
        await moveOrderToPaidOrThrow({
          orderUID: order.orderUID,
          tx: prismaMock,
        });
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
        const error: BadRequestError = err as BadRequestError;
        expect(error.message).toEqual(
          'Order state must be in PENDING_TRANSACTION state to move to PAID',
        );
      }
    });
  });

  describe('moveOrderToOpenOrThrow', () => {
    it('should return the order to OPEN state', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      const book1 = fakeBook();
      book1.quantity = 7;
      const item1 = fakeOrderItem();
      item1.bookId = book1.id;
      item1.quantity = 5;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      const book2 = fakeBook();
      book2.quantity = 3;
      const item2 = fakeOrderItem();
      item2.bookId = book2.id;
      item2.quantity = 3;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book2);

      const item3 = fakeOrderItem();
      // item3 has same bookId as item1
      item3.bookId = book1.id;
      item3.quantity = 1;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      const order = {
        ...order1,
        orderItems: [item1, item2, item3],
        orderState: OrderState.PENDING_TRANSACTION,
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);
      prismaMock.order.update.mockResolvedValue(order);

      await moveOrderToOpenOrThrow({
        orderUID: order.orderUID,
        tx: prismaMock,
      });

      expect(prismaMock.order.findFirstOrThrow).toHaveBeenCalledWith({
        include: { orderItems: true },
        where: { orderUID: order.orderUID },
      });

      // 3 order items, but only 2 books total
      expect(prismaMock.book.update).toHaveBeenCalledTimes(2);
      expect(prismaMock.book.update).toHaveBeenNthCalledWith(1, {
        // book1 + item1 + item3
        data: { quantity: 7 + 5 + 1 },
        where: { id: item1.bookId },
      });
      expect(prismaMock.book.update).toHaveBeenNthCalledWith(2, {
        // book2 + item2
        data: { quantity: 3 + 3 },
        where: { id: item2.bookId },
      });

      expect(prismaMock.order.update).toHaveBeenCalledWith({
        data: {
          orderState: OrderState.OPEN,
        },
        where: { orderUID: order.orderUID },
      });
    });

    it('should skip updating books for non-book product types', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));

      const book1 = fakeBook();
      book1.quantity = 7;
      const item1 = fakeOrderItem();
      item1.bookId = book1.id;
      item1.quantity = 5;
      prismaMock.book.findUniqueOrThrow.mockResolvedValueOnce(book1);

      const item2 = fakeOrderItem();
      // item2 is not a BOOK product type
      item2.productType = 'foo' as ProductType;
      item2.bookId = null;

      const order = {
        ...order1,
        orderItems: [item1, item2],
        orderState: OrderState.PENDING_TRANSACTION,
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);
      prismaMock.order.update.mockResolvedValue(order);

      await moveOrderToOpenOrThrow({
        orderUID: order.orderUID,
        tx: prismaMock,
      });

      // 2 order items, but only 1 of type book
      expect(prismaMock.book.update).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestError when attempting to move order not in PENDING_TRANSACTION state', async () => {
      const order = {
        ...order1,
        orderState: OrderState.PAID,
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);

      expect.assertions(2);
      try {
        await moveOrderToOpenOrThrow({
          orderUID: order.orderUID,
          tx: prismaMock,
        });
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
        const error: BadRequestError = err as BadRequestError;
        expect(error.message).toEqual(
          'Order state must be in PENDING_TRANSACTION state to move to OPEN',
        );
      }
    });
  });

  describe('deleteOrder', () => {
    it('should delete the order', async () => {
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order1);
      prismaMock.order.delete.mockResolvedValue(order1);

      await deleteOrder(order1.orderUID);

      expect(prismaMock.order.findFirstOrThrow).toHaveBeenCalledWith({
        where: { orderUID: order1.orderUID },
      });

      expect(prismaMock.order.delete).toHaveBeenCalledWith({
        where: { orderUID: order1.orderUID },
      });
    });

    it('should throw BadRequestError when attempting to delete order not in OPEN state', async () => {
      const order = {
        ...order1,
        orderState: OrderState.PAID,
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);

      expect.assertions(2);
      try {
        await deleteOrder(order.orderUID);
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
        const error: BadRequestError = err as BadRequestError;
        expect(error.message).toEqual(
          'Order state must be in OPEN state to delete',
        );
      }
    });
  });

  describe('getOrders', () => {
    it('should get orders when provided with default input', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        resolvedOrder1,
        resolvedOrder2,
        resolvedOrder3,
      ]);

      const result = await getOrders({});

      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        ...buildPaginationRequest({}),
        include: {
          _count: {
            select: { orderItems: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        orders: [
          {
            ...resolvedOrder1,
            numOrderItems: 3,
          },
          {
            ...resolvedOrder2,
            numOrderItems: 8,
          },
          {
            ...resolvedOrder3,
            numOrderItems: 0,
          },
        ],
        pageInfo: {
          endCursor: order3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: order1.id.toString(),
        },
      });
    });

    it('should get orders when provided with pagination query input', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        resolvedOrder2,
        resolvedOrder3,
      ]);

      const result = await getOrders({
        paginationQuery: {
          after: '1',
          first: 2,
        },
      });

      expect(result).toEqual({
        orders: [
          {
            ...resolvedOrder2,
            numOrderItems: 8,
          },
          {
            ...resolvedOrder3,
            numOrderItems: 0,
          },
        ],
        pageInfo: {
          endCursor: order3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: order2.id.toString(),
        },
      });
    });
  });

  describe('getOrderWithItems', () => {
    it('should provide the correct input to prisma', async () => {
      const orderWithItems: OrderWithItemsHydrated = {
        ...fakeOrder(),
        orderItems: [fakeOrderItemHydrated(), fakeOrderItemHydrated()],
      };

      prismaMock.order.findUnique.mockResolvedValue(orderWithItems);

      const result = await getOrderWithItems('uid123');

      expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
        include: {
          orderItems: {
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
            orderBy: { createdAt: 'asc' },
          },
        },
        where: { orderUID: 'uid123' },
      });
      expect(result).toEqual(orderWithItems);
    });

    it('should return null when no order exists', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);
      const result = await getOrderWithItems('uid123');
      expect(result).toEqual(null);
    });

    it('should process non-book product type order items', async () => {
      const order = fakeOrder();
      const orderItemHydrated1 = fakeOrderItemHydrated();
      const orderItemHydrated2 = fakeOrderItemHydrated();
      const orderItemHydrated3 = fakeOrderItemHydrated();
      const orderWithNonBookItems: OrderWithItemsHydrated = {
        ...order,
        orderItems: [
          orderItemHydrated1,
          orderItemHydrated2,
          {
            ...orderItemHydrated3,
            productType: 'foo' as ProductType,
          },
        ],
      };

      prismaMock.order.findUnique.mockResolvedValue(orderWithNonBookItems);

      const result = await getOrderWithItems('uid123');

      expect(result).toEqual({
        ...order,
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
      });
    });
  });

  describe('getOrder', () => {
    it('returns the order when it exists', async () => {
      prismaMock.order.findUnique.mockResolvedValue(order1);
      const result = await getOrder('uid123');
      expect(result).toEqual(order1);
    });

    it('returns null when order does not exist', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);
      const result = await getOrder('uid123');
      expect(result).toEqual(null);
    });
  });
});
