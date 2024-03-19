'use server';

import { recomputeOrderTotals } from '@/lib/actions/order';
import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import OrderItemCreateInput from '@/types/OrderItemCreateInput';
import { OrderItem, Prisma, ProductType } from '@prisma/client';

export async function createOrderItem(
  orderItem: OrderItemCreateInput,
): Promise<OrderItem> {
  const { bookId, orderId, quantity } = orderItem;

  // we only handle order items of product type Book at this time
  const productType = ProductType.BOOK;
  if (!bookId) {
    logger.error('createOrderItem asked to create without bookId');
    throw new Error('bookId required as input at this time');
  }

  const book = await prisma.book.findUniqueOrThrow({ where: { id: bookId } });
  const productPriceInCents = book.priceInCents;
  const totalPriceInCents = productPriceInCents * quantity;

  return prisma.$transaction(
    async (tx) => {
      const createdOrderItem = await tx.orderItem.create({
        data: {
          book: {
            connect: { id: bookId },
          },
          order: {
            connect: { id: orderId },
          },
          productPriceInCents,
          productType,
          quantity,
          totalPriceInCents,
        },
      });

      logger.trace('created order item in DB: %j', createdOrderItem);

      await recomputeOrderTotals({ orderItem: createdOrderItem, tx });

      return createdOrderItem;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
