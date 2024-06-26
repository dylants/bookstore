import SquareError from '@/lib/errors/SquareError';
import { fakeTransaction } from '@/lib/fakes/transaction';
import {
  cancelSquareTerminalCheckout,
  createSquareTerminalCheckout,
  getSquareTerminalCheckout,
} from '@/lib/square-terminal-checkout';

const mockCancelTerminalCheckout = jest.fn();
const mockCreateTerminalCheckout = jest.fn();
const mockGetTerminalCheckout = jest.fn();
jest.mock('./square', () => ({
  terminalApi: {
    cancelTerminalCheckout: (...args: unknown[]) =>
      mockCancelTerminalCheckout(...args),
    createTerminalCheckout: (...args: unknown[]) =>
      mockCreateTerminalCheckout(...args),
    getTerminalCheckout: (...args: unknown[]) =>
      mockGetTerminalCheckout(...args),
  },
}));

describe('square-terminal-checkout', () => {
  const transaction = fakeTransaction();

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('createSquareTerminalCheckout', () => {
    beforeEach(() => {
      process.env.SQUARE_DEVICE_ID = 'deviceId123';
    });

    it('should create the terminal checkout', async () => {
      mockCreateTerminalCheckout.mockResolvedValue({
        result: {
          checkout: {
            amountMoney: { amount: transaction.amountInCents },
            id: 'checkoutId987',
            status: 'PENDING',
          },
        },
        statusCode: 200,
      });

      const checkout = await createSquareTerminalCheckout({ transaction });

      expect(mockCreateTerminalCheckout).toHaveBeenCalledWith({
        checkout: {
          amountMoney: {
            amount: BigInt(transaction.amountInCents),
            currency: 'USD',
          },
          deviceOptions: {
            collectSignature: false,
            deviceId: 'deviceId123',
            skipReceiptScreen: false,
            tipSettings: {
              allowTipping: false,
            },
          },
          referenceId: transaction.transactionUID,
        },
        idempotencyKey: transaction.transactionUID,
      });

      expect(checkout).toEqual({
        amountInCents: transaction.amountInCents,
        checkoutId: 'checkoutId987',
        status: 'PENDING',
      });
    });

    it('should throw error when deviceId is not available', async () => {
      process.env.SQUARE_DEVICE_ID = undefined;
      expect.assertions(2);
      try {
        await createSquareTerminalCheckout({ transaction });
      } catch (err) {
        expect(err instanceof Error).toBeTruthy();
        const error: Error = err as Error;
        expect(error.message).toEqual(
          'deviceId required to create Square Terminal Checkout',
        );
      }
    });

    it('should throw error when square response is failing status code', async () => {
      mockCreateTerminalCheckout.mockResolvedValue({
        result: {},
        statusCode: 500,
      });

      expect.assertions(2);
      try {
        await createSquareTerminalCheckout({ transaction });
      } catch (err) {
        expect(err instanceof SquareError).toBeTruthy();
        const error: SquareError = err as SquareError;
        expect(error.message).toEqual('Failed to create Terminal Checkout');
      }
    });

    it('should throw error when square response is missing', async () => {
      mockCreateTerminalCheckout.mockResolvedValue({
        result: {},
        statusCode: 200,
      });

      expect.assertions(2);
      try {
        await createSquareTerminalCheckout({ transaction });
      } catch (err) {
        expect(err instanceof SquareError).toBeTruthy();
        const error: SquareError = err as SquareError;
        expect(error.message).toEqual('Failed to create Terminal Checkout');
      }
    });

    it('should throw error when square response is missing checkout', async () => {
      mockCreateTerminalCheckout.mockResolvedValue({
        result: {
          checkout: {
            amountMoney: {},
          },
        },
        statusCode: 200,
      });

      expect.assertions(2);
      try {
        await createSquareTerminalCheckout({ transaction });
      } catch (err) {
        expect(err instanceof SquareError).toBeTruthy();
        const error: SquareError = err as SquareError;
        expect(error.message).toEqual(
          'Invalid Terminal Checkout response for create checkout',
        );
      }
    });
  });

  describe('getSquareTerminalCheckout', () => {
    const checkoutId = 'checkoutId987';

    it('should get the terminal checkout', async () => {
      mockGetTerminalCheckout.mockResolvedValue({
        result: {
          checkout: {
            id: checkoutId,
            paymentType: 'CARD_PRESENT',
            status: 'PENDING',
          },
        },
        statusCode: 200,
      });

      const checkout = await getSquareTerminalCheckout({ checkoutId });

      expect(mockGetTerminalCheckout).toHaveBeenCalledWith(checkoutId);

      expect(checkout).toEqual({
        checkoutId,
        paymentType: 'CARD_PRESENT',
        status: 'PENDING',
      });
    });

    it('should get the cancelled terminal checkout', async () => {
      mockGetTerminalCheckout.mockResolvedValue({
        result: {
          checkout: {
            cancelReason: 'TIMED_OUT',
            id: checkoutId,
            paymentType: 'CARD_PRESENT',
            status: 'CANCELED',
          },
        },
        statusCode: 200,
      });

      const checkout = await getSquareTerminalCheckout({ checkoutId });

      expect(mockGetTerminalCheckout).toHaveBeenCalledWith(checkoutId);

      expect(checkout).toEqual({
        cancelReason: 'TIMED_OUT',
        checkoutId,
        paymentType: 'CARD_PRESENT',
        status: 'CANCELED',
      });
    });

    it('should throw error when square response is failing status code', async () => {
      mockGetTerminalCheckout.mockResolvedValue({
        result: {},
        statusCode: 500,
      });

      expect.assertions(2);
      try {
        await getSquareTerminalCheckout({ checkoutId });
      } catch (err) {
        expect(err instanceof SquareError).toBeTruthy();
        const error: SquareError = err as SquareError;
        expect(error.message).toEqual(
          `Failed to get Terminal Checkout for checkoutId: ${checkoutId}`,
        );
      }
    });

    it('should throw error when square response is missing', async () => {
      mockGetTerminalCheckout.mockResolvedValue({
        result: {},
        statusCode: 200,
      });

      expect.assertions(2);
      try {
        await getSquareTerminalCheckout({ checkoutId });
      } catch (err) {
        expect(err instanceof SquareError).toBeTruthy();
        const error: SquareError = err as SquareError;
        expect(error.message).toEqual(
          `Failed to get Terminal Checkout for checkoutId: ${checkoutId}`,
        );
      }
    });

    it('should throw error when square response is missing checkout', async () => {
      mockGetTerminalCheckout.mockResolvedValue({
        result: {
          checkout: {},
        },
        statusCode: 200,
      });

      expect.assertions(2);
      try {
        await getSquareTerminalCheckout({ checkoutId });
      } catch (err) {
        expect(err instanceof SquareError).toBeTruthy();
        const error: SquareError = err as SquareError;
        expect(error.message).toEqual(
          `Invalid Terminal Checkout response for get checkout, checkoutId: ${checkoutId}`,
        );
      }
    });
  });

  describe('cancelSquareTerminalCheckout', () => {
    const checkoutId = 'checkoutId987';

    it('should cancel the terminal checkout', async () => {
      mockCancelTerminalCheckout.mockResolvedValue({
        result: {
          checkout: {
            cancelReason: 'BUYER_CANCELED',
            id: checkoutId,
            status: 'CANCELED',
          },
        },
        statusCode: 200,
      });

      const checkout = await cancelSquareTerminalCheckout({ checkoutId });

      expect(mockCancelTerminalCheckout).toHaveBeenCalledWith(checkoutId);

      expect(checkout).toEqual({
        cancelReason: 'BUYER_CANCELED',
        checkoutId,
        status: 'CANCELED',
      });
    });

    it('should throw error when square response is failing status code', async () => {
      mockCancelTerminalCheckout.mockResolvedValue({
        result: {},
        statusCode: 500,
      });

      expect.assertions(2);
      try {
        await cancelSquareTerminalCheckout({ checkoutId });
      } catch (err) {
        expect(err instanceof SquareError).toBeTruthy();
        const error: SquareError = err as SquareError;
        expect(error.message).toEqual(
          `Failed to cancel Terminal Checkout for checkoutId: ${checkoutId}`,
        );
      }
    });

    it('should throw error when square response is missing', async () => {
      mockCancelTerminalCheckout.mockResolvedValue({
        result: {},
        statusCode: 200,
      });

      expect.assertions(2);
      try {
        await cancelSquareTerminalCheckout({ checkoutId });
      } catch (err) {
        expect(err instanceof SquareError).toBeTruthy();
        const error: SquareError = err as SquareError;
        expect(error.message).toEqual(
          `Failed to cancel Terminal Checkout for checkoutId: ${checkoutId}`,
        );
      }
    });

    it('should throw error when square response is missing checkout', async () => {
      mockCancelTerminalCheckout.mockResolvedValue({
        result: {
          checkout: {},
        },
        statusCode: 200,
      });

      expect.assertions(2);
      try {
        await cancelSquareTerminalCheckout({ checkoutId });
      } catch (err) {
        expect(err instanceof SquareError).toBeTruthy();
        const error: SquareError = err as SquareError;
        expect(error.message).toEqual(
          `Invalid Terminal Checkout response for cancel checkout, checkoutId: ${checkoutId}`,
        );
      }
    });
  });
});
