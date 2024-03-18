'use server';

import { recomputeOrderTotals } from '@/lib/actions/order';
import logger from '@/lib/logger';
import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { serializeBookSource } from '@/lib/serializers/book-source';
import OrderItemCreateInput from '@/types/OrderItemCreateInput';
import OrderItemHydrated from '@/types/OrderItemHydrated';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
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

export interface GetOrderItemsParams {
  paginationQuery?: PaginationQuery;
  orderUID?: string;
}

export interface GetOrderItemsResult {
  orderItems: Array<OrderItemHydrated>;
  pageInfo: PageInfo;
}

export async function getOrderItems({
  paginationQuery,
  orderUID,
}: GetOrderItemsParams): Promise<GetOrderItemsResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const rawItems = await prisma.orderItem.findMany({
    ...paginationRequest,
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
    where: { order: { orderUID } },
  });

  const items = rawItems.map((item) => {
    if (item.productType !== ProductType.BOOK) {
      // we have no other product types at this time, so this should not happen
      logger.warn('non-book product type encountered: %j', item);
      return {
        ...item,
        book: undefined,
        bookId: null,
      };
    }

    // we can assume the book is available based on code above
    const itemBook = item.book!;

    return {
      ...item,
      book: {
        ...itemBook,
        publisher: serializeBookSource(itemBook.publisher),
      },
    };
  });

  const { items: orderItems, pageInfo } =
    buildPaginationResponse<OrderItemHydrated>({
      items,
      paginationQuery,
    });

  return {
    orderItems,
    pageInfo,
  };
}
