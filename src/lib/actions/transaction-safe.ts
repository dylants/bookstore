import {
  cancelTransaction,
  createTransaction,
  syncTransactionStatus,
} from '@/lib/actions/transaction';
import BadRequestError from '@/lib/errors/BadRequestError';
import NegativeBookQuantityError from '@/lib/errors/NegativeBookQuantityError';
import logger from '@/lib/logger';
import { HttpResponse } from '@/types/HttpResponse';
import { Order, Transaction } from '@prisma/client';

export async function createTransactionSafe(
  orderUID: Order['orderUID'],
): Promise<
  HttpResponse<Transaction | null, BadRequestError | NegativeBookQuantityError>
> {
  try {
    const transaction = await createTransaction(orderUID);

    return {
      data: transaction,
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

    logger.error('Unknown error occurred in createTransaction');
    logger.error(err);
    return {
      data: null,
      status: 500,
    };
  }
}

export async function syncTransactionStatusSafe(
  transactionUID: Transaction['transactionUID'],
): Promise<HttpResponse<Transaction | null, BadRequestError>> {
  try {
    const transaction = await syncTransactionStatus(transactionUID);

    return {
      data: transaction,
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

    logger.error('Unknown error occurred in syncTransactionStatus');
    logger.error(err);
    return {
      data: null,
      status: 500,
    };
  }
}

export async function cancelTransactionSafe(
  transactionUID: Transaction['transactionUID'],
): Promise<HttpResponse<Transaction | null, BadRequestError>> {
  try {
    const transaction = await cancelTransaction(transactionUID);

    return {
      data: transaction,
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

    logger.error('Unknown error occurred in cancelTransaction');
    logger.error(err);
    return {
      data: null,
      status: 500,
    };
  }
}
