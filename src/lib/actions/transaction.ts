import {
  SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED,
  SQUARE_TERMINAL_CHECKOUT_STATUS_COMPLETED,
  createSquareTerminalCheckout,
  getSquareTerminalCheckout,
} from '@/lib/square-terminal-checkout';
import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import {
  Prisma,
  SquareCheckout,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

export async function createTransactionOrThrow(
  orderUID: string,
): Promise<Transaction> {
  return prisma.$transaction(
    async (tx) => {
      // TODO update the order to PENDING_TRANSACTION

      const order = await tx.order.findFirstOrThrow({
        where: { orderUID },
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

  // TODO update the order to PAID

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

  // TODO update the order to OPEN

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

      const {
        orderUID,
        squareCheckout,
        status: previousTransactionStatus,
        transactionType,
      } = transaction;

      if (isTransactionStatusTerminal(previousTransactionStatus)) {
        logger.info(
          'requested to sync transaction status for transaction in terminal state, no updates for transactionUID: %s',
          transactionUID,
        );
        return transaction;
      }

      // we only support Square checkout at this time
      if (
        transactionType !== TransactionType.SQUARE_CHECKOUT ||
        !squareCheckout
      ) {
        logger.error(
          'Unsupported transactionType %s for transactionUID: %s',
          transactionType,
          transactionUID,
        );
        throw new Error('Unsupported transactionType: ' + transactionType);
      }

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
