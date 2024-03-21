'use server';

import { reduceBookUpdates, updateBookQuantity } from '@/lib/actions/book';
import BadRequestError from '@/lib/errors/BadRequestError';
import NegativeBookQuantityError from '@/lib/errors/NegativeBookQuantityError';
import logger from '@/lib/logger';
import { computeTax } from '@/lib/money';
import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { serializeBookSource } from '@/lib/serializers/book-source';
import { HttpResponse } from '@/types/HttpResponse';
import OrderHydrated from '@/types/OrderHydrated';
import OrderWithItemsHydrated from '@/types/OrderWithItemsHydrated';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import {
  Order,
  OrderItem,
  OrderState,
  Prisma,
  ProductType,
} from '@prisma/client';
import { format } from 'date-fns';

export async function createOrder(): Promise<OrderWithItemsHydrated> {
  const { id } = await prisma.order.create({
    data: {
      orderOpenedDate: new Date(),
      orderState: OrderState.OPEN,
      subTotalInCents: 0,
      taxInCents: 0,
      totalInCents: 0,
    },
  });

  // set a more readable UID
  const orderUID = `${format(new Date(), 'yyMMddHHmmss')}-${id}`;
  const createdOrder = await prisma.order.update({
    data: { orderUID },
    where: { id },
  });

  logger.trace('created order in DB: %j', createdOrder);

  return {
    ...createdOrder,
    orderItems: [],
  };
}

export async function recomputeOrderTotals({
  orderItem,
  tx,
}: {
  orderItem: OrderItem;
  tx: Prisma.TransactionClient;
}): Promise<void> {
  const { orderId } = orderItem;

  const order = await tx.order.findUniqueOrThrow({
    where: { id: orderId },
  });

  const subTotalInCents = order.subTotalInCents + orderItem.totalPriceInCents;
  const taxInCents = computeTax(subTotalInCents);
  const totalInCents = subTotalInCents + taxInCents;

  await tx.order.update({
    data: {
      subTotalInCents,
      taxInCents,
      totalInCents,
    },
    where: { id: orderId },
  });
}

export async function completeOrderOrThrow(
  orderUID: Order['orderUID'],
): Promise<Order> {
  const order = await prisma.order.findFirstOrThrow({
    include: { orderItems: true },
    where: { orderUID },
  });

  if (order.orderState !== OrderState.OPEN) {
    throw new BadRequestError('Order state must be in OPEN state to complete');
  }

  const { orderItems } = order;

  // condense all the book updates by book ID
  const bookUpdates = await reduceBookUpdates(orderItems);

  return prisma.$transaction(
    async (tx) => {
      logger.trace('updating books for %d order items...', orderItems.length);
      await Promise.all(
        bookUpdates.map((update) =>
          updateBookQuantity({
            bookId: update.id,
            quantityChange: update.decreasedQuantity,
            tx,
          }),
        ),
      );

      logger.trace(
        'book updates successful, performing transaction, orderUID: %s',
        orderUID,
      );
      // TODO here we'd actually perform the transaction

      logger.trace(
        'transaction successful, marking order paid, orderUID: %s',
        orderUID,
      );
      const order = await tx.order.update({
        data: {
          orderClosedDate: new Date(),
          orderState: OrderState.PAID,
        },
        where: { orderUID },
      });

      logger.trace('order marked as paid and closed!');
      return order;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function completeOrder(
  orderUID: Order['orderUID'],
): Promise<
  HttpResponse<Order | null, BadRequestError | NegativeBookQuantityError>
> {
  try {
    const order = await completeOrderOrThrow(orderUID);

    return {
      data: order,
      status: 200,
    };
  } catch (err: unknown) {
    if (
      err instanceof BadRequestError ||
      err instanceof NegativeBookQuantityError
    ) {
      return {
        data: null,
        error: {
          ...err,
          message: err.message,
          name: err.name,
        },
        status: 400,
      };
    }

    return {
      data: null,
      status: 500,
    };
  }
}

export async function deleteOrderOrThrow(orderUID: Order['orderUID']) {
  const order = await prisma.order.findFirstOrThrow({
    where: { orderUID },
  });

  if (order.orderState !== OrderState.OPEN) {
    throw new BadRequestError('Order state must be in OPEN state to delete');
  }

  await prisma.order.delete({
    where: { orderUID },
  });
}

export async function deleteOrder(
  orderUID: Order['orderUID'],
): Promise<HttpResponse<null, BadRequestError>> {
  try {
    await deleteOrderOrThrow(orderUID);

    return {
      data: null,
      status: 200,
    };
  } catch (err: unknown) {
    if (err instanceof BadRequestError) {
      return {
        data: null,
        error: {
          ...err,
          message: err.message,
          name: err.name,
        },
        status: 400,
      };
    }

    return {
      data: null,
      status: 500,
    };
  }
}

export interface GetOrdersParams {
  paginationQuery?: PaginationQuery;
}

export interface GetOrdersResult {
  orders: Array<OrderHydrated>;
  pageInfo: PageInfo;
}

export async function getOrders({
  paginationQuery,
}: GetOrdersParams): Promise<GetOrdersResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const rawItems = await prisma.order.findMany({
    ...paginationRequest,
    include: {
      _count: {
        select: { orderItems: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const items = rawItems.map((item) => ({
    ...item,
    numOrderItems: item._count.orderItems,
  }));

  const { items: orders, pageInfo } = buildPaginationResponse<OrderHydrated>({
    items,
    paginationQuery,
  });

  return {
    orders,
    pageInfo,
  };
}

export async function getOrderWithItems(
  orderUID: Order['orderUID'],
): Promise<OrderWithItemsHydrated | null> {
  const order = await prisma.order.findUnique({
    include: {
      // We're not paginating the order items, which assumes the list is
      // not long. But at this point we can assume that safely.
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
        orderBy: { createdAt: 'desc' },
      },
    },
    where: { orderUID },
  });

  if (!order) {
    return null;
  }

  const items = order.orderItems.map((item) => {
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

  return {
    ...order,
    orderItems: items,
  };
}

export async function getOrder(
  orderUID: Order['orderUID'],
): Promise<Order | null> {
  const order = await prisma.order.findUnique({ where: { orderUID } });
  return order || null;
}

export async function getOrderState(
  orderUID: Order['orderUID'],
): Promise<OrderState | null> {
  const order = await prisma.order.findUnique({ where: { orderUID } });
  return order?.orderState || null;
}
