import SquareError from '@/lib/errors/SquareError';
import logger from '@/lib/logger';
import squareClient from '@/lib/square';
import { Transaction } from '@prisma/client';

// https://developer.squareup.com/reference/square/objects/TerminalCheckout#definition__property-status
export const SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED = 'CANCELED';
export const SQUARE_TERMINAL_CHECKOUT_STATUS_COMPLETED = 'COMPLETED';

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
      'create checkout response does not include required fields %j',
      checkout,
    );
    throw new SquareError(
      'Invalid Terminal Checkout response for create checkout',
    );
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
      'get checkout response does not include required fields %j',
      checkout,
    );
    throw new SquareError(
      `Invalid Terminal Checkout response for get checkout, checkoutId: ${checkoutId}`,
    );
  }

  return {
    checkoutId,
    paymentType,
    status,
  };
}

export type CancelSquareTerminalCheckoutResult = {
  checkoutId: string;
  status: string;
};

export async function cancelSquareTerminalCheckout({
  checkoutId,
}: {
  checkoutId: string;
}): Promise<CancelSquareTerminalCheckoutResult> {
  const response =
    await squareClient.terminalApi.cancelTerminalCheckout(checkoutId);

  const {
    result: { checkout, errors },
    statusCode,
  } = response;

  if (statusCode !== 200 || !checkout) {
    logger.error(
      'square cancel terminal checkout call failed for checkoutId %s',
      checkoutId,
    );
    logger.error(errors);
    throw new SquareError(
      `Failed to cancel Terminal Checkout for checkoutId: ${checkoutId}`,
    );
  }

  const { status } = checkout;

  if (!status) {
    logger.error(
      'cancel checkout response does not include required fields %j',
      checkout,
    );
    throw new SquareError(
      `Invalid Terminal Checkout response for cancel checkout, checkoutId: ${checkoutId}`,
    );
  }

  return {
    checkoutId,
    status,
  };
}
