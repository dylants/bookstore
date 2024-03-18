'use server';

import { updateBookQuantity } from '@/lib/actions/book';
import BadRequestError from '@/lib/errors/BadRequestError';
import NegativeBookQuantityError from '@/lib/errors/NegativeBookQuantityError';
import logger from '@/lib/logger';
import { computeTax } from '@/lib/money';
import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { HttpResponse } from '@/types/HttpResponse';
import OrderHydrated from '@/types/OrderHydrated';
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

export async function createOrder(): Promise<Order> {
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

  return createdOrder;
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
  orderId: Order['id'],
): Promise<Order> {
  const order = await prisma.order.findFirstOrThrow({
    include: { orderItems: true },
    where: { id: orderId },
  });

  if (order.orderState !== OrderState.OPEN) {
    throw new BadRequestError('Order state must be in OPEN state to complete');
  }

  const { orderItems } = order;

  // condense all the book updates by book ID
  const bookUpdates = orderItems.reduce(
    (acc, item) => {
      if (item.productType !== ProductType.BOOK || item.bookId === null) {
        logger.warn(
          'non-book product type encountered, skipping order item: %j',
          item,
        );
        return acc;
      }

      const match = acc.find((i) => i.id === item.bookId);
      if (match) {
        match.decreaseQuantity -= item.quantity;
      } else {
        acc.push({
          decreaseQuantity: -item.quantity,
          id: item.bookId,
        });
      }
      return acc;
    },
    [] as Array<{ id: number; decreaseQuantity: number }>,
  );

  return prisma.$transaction(
    async (tx) => {
      logger.trace('updating books for %d order items...', orderItems.length);
      await Promise.all(
        bookUpdates.map((update) =>
          updateBookQuantity({
            bookId: update.id,
            quantityChange: update.decreaseQuantity,
            tx,
          }),
        ),
      );

      logger.trace(
        'book updates successful, performing transaction, orderId: %s',
        orderId,
      );
      // TODO here we'd actually perform the transaction

      logger.trace(
        'transaction successful, marking order paid, orderId: %s',
        orderId,
      );
      const order = await tx.order.update({
        data: {
          orderClosedDate: new Date(),
          orderState: OrderState.PAID,
        },
        where: { id: orderId },
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
  orderId: Order['id'],
): Promise<
  HttpResponse<Order | null, BadRequestError | NegativeBookQuantityError>
> {
  try {
    const order = await completeOrderOrThrow(orderId);

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

export async function deleteOrderOrThrow(orderId: Order['id']) {
  const order = await prisma.order.findFirstOrThrow({
    where: { id: orderId },
  });

  if (order.orderState !== OrderState.OPEN) {
    throw new BadRequestError('Order state must be in OPEN state to delete');
  }

  await prisma.order.delete({
    where: { id: orderId },
  });
}

export async function deleteOrder(
  orderId: Order['id'],
): Promise<HttpResponse<null, BadRequestError>> {
  try {
    await deleteOrderOrThrow(orderId);

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

export async function getOrder(
  orderUID: Order['orderUID'],
): Promise<OrderHydrated | null> {
  const order = await prisma.order.findUnique({
    include: {
      _count: {
        select: { orderItems: true },
      },
    },
    where: { orderUID },
  });

  if (order) {
    return {
      ...order,
      numOrderItems: order._count.orderItems,
    };
  } else {
    return null;
  }
}
