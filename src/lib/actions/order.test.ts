import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import {
  completeOrder,
  completeOrderOrThrow,
  createOrder,
  deleteOrder,
  deleteOrderOrThrow,
  getOrder,
  getOrders,
} from '@/lib/actions/order';
import { Order, OrderState, ProductType } from '@prisma/client';
import { fakeOrder } from '@/lib/fakes/order';
import { fakeOrderItem } from '@/lib/fakes/order-item';
import { fakeBook } from '@/lib/fakes/book';
import NegativeBookQuantityError from '@/lib/errors/NegativeBookQuantityError';
import BadRequestError from '@/lib/errors/BadRequestError';
import { buildPaginationRequest } from '@/lib/pagination';

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

      await createOrder();

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
    });
  });

  describe('completeOrderOrThrow', () => {
    it('should complete the order', async () => {
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

      await completeOrderOrThrow(order.id);

      expect(prismaMock.order.findFirstOrThrow).toHaveBeenCalledWith({
        include: { orderItems: true },
        where: { id: order.id },
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
          orderClosedDate: new Date('2021-02-03T12:13:14.000Z'),
          orderState: OrderState.PAID,
        },
        where: { id: order.id },
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

      await completeOrderOrThrow(order.id);

      // 2 order items, but only 1 of type book
      expect(prismaMock.book.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NegativeBookQuantityError when attempting to complete order with insufficient inventory', async () => {
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

      expect.assertions(3);
      try {
        await completeOrderOrThrow(order.id);
      } catch (err) {
        expect(err instanceof NegativeBookQuantityError).toBeTruthy();
        const error: NegativeBookQuantityError =
          err as NegativeBookQuantityError;
        expect(error.book).toEqual(book1);
        expect(error.message).toEqual(
          'Attempting to set a negative quantity for Book',
        );
      }
    });

    it('should throw BadRequestError when attempting to complete order not in OPEN state', async () => {
      const order = {
        ...order1,
        orderState: OrderState.PAID,
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);

      expect.assertions(2);
      try {
        await completeOrderOrThrow(order.id);
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
        const error: BadRequestError = err as BadRequestError;
        expect(error.message).toEqual(
          'Order state must be in OPEN state to complete',
        );
      }
    });
  });

  describe('completeOrder', () => {
    it('should return the order when successful', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));
      const order = {
        ...order1,
        orderItems: [],
      };
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);
      prismaMock.order.update.mockResolvedValue(order);

      expect(await completeOrder(1)).toEqual({
        data: order,
        status: 200,
      });
    });

    it('should return error when completeOrderOrThrow throws BadRequestError', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      prismaMock.order.findFirstOrThrow.mockRejectedValue(
        new BadRequestError('bad input'),
      );

      expect(await completeOrder(1)).toEqual({
        data: null,
        error: {
          message: 'bad input',
          name: BadRequestError.name,
        },
        status: 400,
      });
    });

    it('should return error when completeOrderOrThrow throws NegativeBookQuantityError', async () => {
      const book = fakeBook();
      // kinda hacky, but mocking this function is the simplest solution
      prismaMock.order.findFirstOrThrow.mockRejectedValue(
        new NegativeBookQuantityError(book),
      );

      expect(await completeOrder(1)).toEqual({
        data: null,
        error: {
          book,
          message: 'Attempting to set a negative quantity for Book',
          name: NegativeBookQuantityError.name,
        },
        status: 400,
      });
    });

    it('should return error when completeOrderOrThrow throws Error', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      prismaMock.order.findFirstOrThrow.mockRejectedValue(
        new Error('unrecognized error'),
      );

      expect(await completeOrder(1)).toEqual({
        data: null,
        status: 500,
      });
    });
  });

  describe('deleteOrderOrThrow', () => {
    it('should delete the order', async () => {
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order1);
      prismaMock.order.delete.mockResolvedValue(order1);

      await deleteOrderOrThrow(order1.id);

      expect(prismaMock.order.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: order1.id },
      });

      expect(prismaMock.order.delete).toHaveBeenCalledWith({
        where: { id: order1.id },
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
        await deleteOrderOrThrow(order.id);
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
        const error: BadRequestError = err as BadRequestError;
        expect(error.message).toEqual(
          'Order state must be in OPEN state to delete',
        );
      }
    });
  });

  describe('deleteOrder', () => {
    it('should return 200 when successful', async () => {
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order1);
      prismaMock.order.delete.mockResolvedValue(order1);

      expect(await deleteOrder(1)).toEqual({
        data: null,
        status: 200,
      });
    });

    it('should return error when deleteOrderOrThrow throws BadRequestError', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      prismaMock.order.findFirstOrThrow.mockRejectedValue(
        new BadRequestError('bad input'),
      );

      expect(await deleteOrder(1)).toEqual({
        data: null,
        error: {
          message: 'bad input',
          name: BadRequestError.name,
        },
        status: 400,
      });
    });

    it('should return error when deleteOrderOrThrow throws Error', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      prismaMock.order.findFirstOrThrow.mockRejectedValue(
        new Error('unrecognized error'),
      );

      expect(await deleteOrder(1)).toEqual({
        data: null,
        status: 500,
      });
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

  describe('getOrder', () => {
    it('should provide the correct input to prisma', async () => {
      prismaMock.order.findUnique.mockResolvedValue(resolvedOrder1);

      const result = await getOrder('uid123');

      expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { orderItems: true },
          },
        },
        where: { orderUID: 'uid123' },
      });
      expect(result).toEqual({
        ...resolvedOrder1,
        numOrderItems: 3,
      });
    });

    it('should return null when no order exists', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);
      const result = await getOrder('uid123');
      expect(result).toEqual(null);
    });
  });
});
