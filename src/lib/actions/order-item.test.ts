import { createOrderItem } from '@/lib/actions/order-item';
import { fakeOrderItem } from '@/lib/fakes/order-item';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeBook } from '@/lib/fakes/book';
import { fakeOrder } from '@/lib/fakes/order';
import { computeTax } from '@/lib/money';
import { ProductType } from '@prisma/client';

describe('order item actions', () => {
  const order1 = fakeOrder();
  const orderItem1 = fakeOrderItem();
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
});
