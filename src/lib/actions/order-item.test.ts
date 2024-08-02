import { createOrderItem, editOrderItem } from '@/lib/actions/order-item';
import { fakeOrderItem } from '@/lib/fakes/order-item';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeBook } from '@/lib/fakes/book';
import { fakeOrder } from '@/lib/fakes/order';
import { computeTax } from '@/lib/money';
import { Order, ProductType } from '@prisma/client';

describe('order item actions', () => {
  const order1 = fakeOrder();
  const orderItem1 = fakeOrderItem();
  const orderItem2 = fakeOrderItem();
  const book1 = fakeBook();

  describe('createOrderItem', () => {
    it('should create order item', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));
      prismaMock.book.findUniqueOrThrow.mockResolvedValue(book1);
      prismaMock.order.findUniqueOrThrow.mockResolvedValue({
        ...order1,
        orderItems: [orderItem1, orderItem2],
      } as Order);
      prismaMock.order.update.mockResolvedValue(order1);
      orderItem1.orderId = order1.id;
      orderItem1.bookId = book1.id;
      prismaMock.orderItem.create.mockResolvedValue(orderItem1);

      const result = await createOrderItem({
        ...orderItem1,
        orderUID: order1.orderUID,
      });

      expect(prismaMock.orderItem.create).toHaveBeenCalledWith({
        data: {
          book: {
            connect: { id: book1.id },
          },
          order: {
            connect: { orderUID: order1.orderUID },
          },
          productPriceInCents: book1.priceInCents,
          productType: ProductType.BOOK,
          quantity: orderItem1.quantity,
          totalPriceInCents: orderItem1.quantity * book1.priceInCents,
        },
      });

      const subTotalInCents =
        orderItem1.totalPriceInCents + orderItem2.totalPriceInCents;
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

      expect(result).toEqual(orderItem1);
    });

    it('should throw error without book', async () => {
      await expect(
        createOrderItem({
          ...orderItem1,
          bookId: null,
          orderUID: order1.orderUID,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"bookId required as input at this time"`,
      );
    });
  });

  describe('editOrderItem', () => {
    it('should edit an order item', async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));
      prismaMock.order.findUniqueOrThrow.mockResolvedValue({
        ...order1,
        orderItems: [
          orderItem2,
          {
            ...orderItem1,
            productPriceInCents: 10,
            quantity: 2,
            totalPriceInCents: 20,
          },
        ],
      } as Order);
      orderItem1.orderId = order1.id;
      prismaMock.orderItem.update.mockResolvedValue(orderItem1);

      const result = await editOrderItem({
        orderItemId: order1.id,
        orderItemUpdate: {
          productPriceInCents: 10,
          quantity: 2,
          totalPriceInCents: 20,
        },
      });

      expect(prismaMock.orderItem.update).toHaveBeenCalledWith({
        data: {
          productPriceInCents: 10,
          quantity: 2,
          totalPriceInCents: 20,
        },
        where: { id: order1.id },
      });

      const subTotalInCents = 20 + orderItem2.totalPriceInCents;
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

      expect(result).toEqual(orderItem1);
    });
  });
});
