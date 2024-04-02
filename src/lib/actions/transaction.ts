'use server';

import {
  SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED,
  SQUARE_TERMINAL_CHECKOUT_STATUS_COMPLETED,
  cancelSquareTerminalCheckout,
  createSquareTerminalCheckout,
  getSquareTerminalCheckout,
} from '@/lib/square-terminal-checkout';
import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import {
  Order,
  Prisma,
  SquareCheckout,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { HttpResponse } from '@/types/HttpResponse';
import BadRequestError from '@/lib/errors/BadRequestError';
import NegativeBookQuantityError from '@/lib/errors/NegativeBookQuantityError';
import {
  moveOrderToOpenOrThrow,
  moveOrderToPaidOrThrow,
  moveOrderToPendingTransactionOrThrow,
} from '@/lib/actions/order';

export async function createTransactionOrThrow(
  orderUID: Order['orderUID'],
): Promise<Transaction> {
  return prisma.$transaction(
    async (tx) => {
      logger.trace('request to create transaction, orderUID: %s', orderUID);

      const order = await moveOrderToPendingTransactionOrThrow({
        orderUID,
        tx,
      });

      logger.trace('creating new Transaction for orderUID: %s', orderUID);
      const transaction = await tx.transaction.create({
        data: {
          amountInCents: order.totalInCents,
          order: { connect: { orderUID } },
          status: TransactionStatus.PENDING,
          transactionType: TransactionType.SQUARE_CHECKOUT,
        },
      });

      const checkout = await createSquareTerminalCheckout({ transaction });

      logger.trace(
        'updating transaction to link to Square Checkout checkoutId: %s orderUID: %s',
        checkout.checkoutId,
        orderUID,
      );
      const updatedTransaction = await tx.transaction.update({
        data: {
          squareCheckout: {
            create: {
              ...checkout,
            },
          },
        },
        where: { id: transaction.id },
      });

      logger.trace(
        'Transaction successfully created with Square Checkout transactionUID: %s for orderUID: %s',
        transaction.transactionUID,
        orderUID,
      );
      return updatedTransaction;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function createTransaction(
  orderUID: Order['orderUID'],
): Promise<
  HttpResponse<Transaction | null, BadRequestError | NegativeBookQuantityError>
> {
  try {
    const transaction = await createTransactionOrThrow(orderUID);

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

function verifyTransactionTypeSquareCheckoutOrThrow({
  transaction,
}: {
  transaction: Transaction & {
    squareCheckout: SquareCheckout | null;
  };
}): SquareCheckout {
  const { squareCheckout, transactionType, transactionUID } = transaction;

  if (transactionType !== TransactionType.SQUARE_CHECKOUT || !squareCheckout) {
    logger.error(
      'Unsupported transactionType %s for transactionUID: %s',
      transactionType,
      transactionUID,
    );
    throw new Error('Unsupported transactionType: ' + transactionType);
  }

  return squareCheckout;
}

function isTransactionStatusTerminal(transactionStatus: TransactionStatus) {
  return (
    transactionStatus === TransactionStatus.CANCELLED ||
    transactionStatus === TransactionStatus.COMPLETE
  );
}

async function processCompletedCheckout({
  checkout,
  orderUID,
  transactionUID,
  tx,
}: {
  checkout: Partial<SquareCheckout>;
  orderUID: string;
  transactionUID: string;
  tx: Prisma.TransactionClient;
}): Promise<Transaction> {
  // we don't support split payments at this time,
  // so if the status is complete, the order is fully paid
  logger.info(
    'updating TransactionStatus to COMPLETE, marking order as PAID for transactionUID: %s orderUID: %s',
    transactionUID,
    orderUID,
  );
  const updatedTransaction = await tx.transaction.update({
    data: {
      squareCheckout: {
        update: { ...checkout },
      },
      status: TransactionStatus.COMPLETE,
    },
    where: { transactionUID },
  });

  await moveOrderToPaidOrThrow({ orderUID, tx });

  return updatedTransaction;
}

async function processCancelledCheckout({
  checkout,
  orderUID,
  transactionUID,
  tx,
}: {
  checkout: Partial<SquareCheckout>;
  orderUID: string;
  transactionUID: string;
  tx: Prisma.TransactionClient;
}): Promise<Transaction> {
  logger.info(
    'Updating TransactionStatus to CANCELLED, cancel order to pending transaction transactionUID: %s orderUID: %s',
    transactionUID,
    orderUID,
  );
  const updatedTransaction = await tx.transaction.update({
    data: {
      squareCheckout: {
        update: { ...checkout },
      },
      status: TransactionStatus.CANCELLED,
    },
    where: { transactionUID },
  });

  await moveOrderToOpenOrThrow({ orderUID, tx });

  return updatedTransaction;
}

export async function syncTransactionStatusOrThrow(
  transactionUID: Transaction['transactionUID'],
): Promise<Transaction> {
  return prisma.$transaction(
    async (tx) => {
      logger.trace(
        'syncing transaction status for transactionUID: %s',
        transactionUID,
      );
      const transaction = await tx.transaction.findUniqueOrThrow({
        include: { squareCheckout: true },
        where: { transactionUID },
      });

      const { orderUID, status: previousTransactionStatus } = transaction;

      if (isTransactionStatusTerminal(previousTransactionStatus)) {
        logger.info(
          'requested to sync transaction status for transaction in terminal state, no updates for transactionUID: %s',
          transactionUID,
        );
        return transaction;
      }

      const squareCheckout = verifyTransactionTypeSquareCheckoutOrThrow({
        transaction,
      });

      const { checkoutId } = squareCheckout;
      const checkout = await getSquareTerminalCheckout({ checkoutId });

      if (checkout.status === SQUARE_TERMINAL_CHECKOUT_STATUS_COMPLETED) {
        return processCompletedCheckout({
          checkout,
          orderUID,
          transactionUID,
          tx,
        });
      } else if (
        checkout.status === SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED
      ) {
        return processCancelledCheckout({
          checkout,
          orderUID,
          transactionUID,
          tx,
        });
      } else {
        // Other status options are: PENDING, IN_PROGRESS, CANCEL_REQUESTED
        // https://developer.squareup.com/reference/square/objects/TerminalCheckout#definition__property-status
        logger.info(
          'square checkout still in pending status, no updates for transactionUID: %s',
          transactionUID,
        );
        return transaction;
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function syncTransactionStatus(
  transactionUID: Transaction['transactionUID'],
): Promise<HttpResponse<Transaction | null, BadRequestError>> {
  try {
    const transaction = await syncTransactionStatusOrThrow(transactionUID);

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

export async function cancelTransactionOrThrow(
  transactionUID: Transaction['transactionUID'],
): Promise<Transaction> {
  return prisma.$transaction(
    async (tx) => {
      logger.trace(
        'cancelling transaction, transactionUID: %s',
        transactionUID,
      );
      const transaction = await tx.transaction.findUniqueOrThrow({
        include: { squareCheckout: true },
        where: { transactionUID },
      });

      const { orderUID, status: previousTransactionStatus } = transaction;

      if (isTransactionStatusTerminal(previousTransactionStatus)) {
        logger.info(
          'requested to cancel transaction for transaction in terminal state, no action taken for transactionUID: %s',
          transactionUID,
        );
        return transaction;
      }

      const squareCheckout = verifyTransactionTypeSquareCheckoutOrThrow({
        transaction,
      });

      const { checkoutId } = squareCheckout;
      const checkout = await cancelSquareTerminalCheckout({ checkoutId });

      return processCancelledCheckout({
        checkout,
        orderUID,
        transactionUID,
        tx,
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function cancelTransaction(
  transactionUID: Transaction['transactionUID'],
): Promise<HttpResponse<Transaction | null, BadRequestError>> {
  try {
    const transaction = await cancelTransactionOrThrow(transactionUID);

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
