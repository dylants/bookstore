'use server';

import { deleteOrder } from '@/lib/actions/order';
import BadRequestError from '@/lib/errors/BadRequestError';
import { safeActionWrapper } from '@/lib/safe-action-wrapper';
import { HttpResponse } from '@/types/HttpResponse';
import { Order } from '@prisma/client';

export async function deleteOrderSafe(
  orderUID: Order['orderUID'],
): Promise<HttpResponse<void | null, BadRequestError>> {
  return safeActionWrapper(deleteOrder, orderUID);
}
