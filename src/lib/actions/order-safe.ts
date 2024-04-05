'use server';

import { deleteOrder } from '@/lib/actions/order';
import BadRequestError from '@/lib/errors/BadRequestError';
import { HttpResponse } from '@/types/HttpResponse';
import { Order } from '@prisma/client';

export async function deleteOrderSafe(
  orderUID: Order['orderUID'],
): Promise<HttpResponse<null, BadRequestError>> {
  try {
    await deleteOrder(orderUID);

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
