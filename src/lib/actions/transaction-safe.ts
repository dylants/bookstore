import {
  cancelTransaction,
  createTransaction,
  syncTransactionStatus,
} from '@/lib/actions/transaction';
import BadRequestError from '@/lib/errors/BadRequestError';
import NegativeBookQuantityError from '@/lib/errors/NegativeBookQuantityError';
import { safeActionWrapper } from '@/lib/safe-action-wrapper';
import { HttpResponse } from '@/types/HttpResponse';
import { Order, Transaction } from '@prisma/client';

export async function createTransactionSafe(
  orderUID: Order['orderUID'],
): Promise<
  HttpResponse<Transaction | null, BadRequestError | NegativeBookQuantityError>
> {
  return safeActionWrapper(createTransaction, orderUID);
}

export async function syncTransactionStatusSafe(
  transactionUID: Transaction['transactionUID'],
): Promise<HttpResponse<Transaction | null, BadRequestError>> {
  return safeActionWrapper(syncTransactionStatus, transactionUID);
}

export async function cancelTransactionSafe(
  transactionUID: Transaction['transactionUID'],
): Promise<HttpResponse<Transaction | null, BadRequestError>> {
  return safeActionWrapper(cancelTransaction, transactionUID);
}
