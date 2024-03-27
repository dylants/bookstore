import SquareError from '@/lib/errors/SquareError';
import logger from '@/lib/logger';
import squareClient from '@/lib/square';
import { Transaction } from '@prisma/client';

export type CreateSquareTerminalCheckoutResult = {
  amountInCents: number;
  checkoutId: string;
  status: string;
};

/**
 * Creates a Terminal Checkout on Square
 * https://developer.squareup.com/reference/square/terminal-api/create-terminal-checkout
 */
export async function createSquareTerminalCheckout({
  transaction,
}: {
  transaction: Transaction;
}): Promise<CreateSquareTerminalCheckoutResult> {
  logger.trace('creating Square Terminal Checkout...');

  const deviceId = process.env.SQUARE_DEVICE_ID;
  if (!deviceId) {
    logger.error('deviceId required to create Square Terminal Checkout');
    throw new Error('deviceId required to create Square Terminal Checkout');
  }

  const response = await squareClient.terminalApi.createTerminalCheckout({
    checkout: {
      amountMoney: {
        amount: BigInt(transaction.amountInCents),
        currency: 'USD',
      },
      deviceOptions: {
        collectSignature: false,
        deviceId,
        skipReceiptScreen: false,
        tipSettings: {
          allowTipping: false,
        },
      },
      referenceId: transaction.transactionUID,
    },
    idempotencyKey: transaction.transactionUID,
  });

  const {
    result: { checkout, errors },
    statusCode,
  } = response;

  if (statusCode !== 200 || !checkout) {
    logger.error('square create terminal checkout call failed');
    logger.error(errors);
    throw new SquareError('Failed to create Terminal Checkout');
  }

  const {
    amountMoney: { amount },
    id: checkoutId,
    status,
  } = checkout;

  if (!amount || !checkoutId || !status) {
    logger.error(
      'checkout response does not include required fields %j',
      checkout,
    );
    throw new SquareError('Invalid Terminal Checkout response');
  }

  logger.info('Square Terminal Checkout created, checkoutId: %s', checkoutId);

  return {
    amountInCents: Number(amount),
    checkoutId,
    status,
  };
}

export type GetSquareTerminalCheckoutResult = {
  checkoutId: string;
  paymentType: string | undefined;
  status: string;
};

// https://developer.squareup.com/reference/square/objects/TerminalCheckout#definition__property-status
export const SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED = 'CANCELED';
export const SQUARE_TERMINAL_CHECKOUT_STATUS_COMPLETED = 'COMPLETED';

/**
 * Gets the Terminal Checkout on Square, using the Get Terminal Checkout API:
 * https://developer.squareup.com/reference/square/terminal-api/get-terminal-checkout
 */
export async function getSquareTerminalCheckout({
  checkoutId,
}: {
  checkoutId: string;
}): Promise<GetSquareTerminalCheckoutResult> {
  const response =
    await squareClient.terminalApi.getTerminalCheckout(checkoutId);

  const {
    result: { checkout, errors },
    statusCode,
  } = response;

  if (statusCode !== 200 || !checkout) {
    logger.error(
      'square get terminal checkout call failed for checkoutId %s',
      checkoutId,
    );
    logger.error(errors);
    throw new SquareError(
      `Failed to get Terminal Checkout for checkoutId: ${checkoutId}`,
    );
  }

  const { paymentType, status } = checkout;

  if (!status) {
    logger.error(
      'checkout response does not include required fields %j',
      checkout,
    );
    throw new SquareError('Invalid Terminal Checkout response');
  }

  return {
    checkoutId,
    paymentType,
    status,
  };
}
