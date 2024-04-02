import { fakeOrder } from '@/lib/fakes/order';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeTransaction } from '@/lib/fakes/transaction';
import {
  cancelTransaction,
  cancelTransactionOrThrow,
  createTransaction,
  createTransactionOrThrow,
  syncTransactionStatus,
  syncTransactionStatusOrThrow,
} from '@/lib/actions/transaction';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import {
  SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED,
  SQUARE_TERMINAL_CHECKOUT_STATUS_COMPLETED,
} from '@/lib/square-terminal-checkout';
import BadRequestError from '@/lib/errors/BadRequestError';
import NegativeBookQuantityError from '@/lib/errors/NegativeBookQuantityError';
import { fakeBook } from '@/lib/fakes/book';

const mockCancelSquareTerminalCheckout = jest.fn();
const mockCreateSquareTerminalCheckout = jest.fn();
const mockGetSquareTerminalCheckout = jest.fn();
jest.mock('../square-terminal-checkout', () => ({
  ...jest.requireActual('../square-terminal-checkout'),
  cancelSquareTerminalCheckout: (...args: unknown[]) =>
    mockCancelSquareTerminalCheckout(...args),
  createSquareTerminalCheckout: (...args: unknown[]) =>
    mockCreateSquareTerminalCheckout(...args),
  getSquareTerminalCheckout: (...args: unknown[]) =>
    mockGetSquareTerminalCheckout(...args),
}));

const mockMoveOrderToOpenOrThrow = jest.fn();
const mockMoveOrderToPaidOrThrow = jest.fn();
const mockMoveOrderToPendingTransactionOrThrow = jest.fn();
jest.mock('./order', () => ({
  ...jest.requireActual('./order'),
  moveOrderToOpenOrThrow: (...args: unknown[]) =>
    mockMoveOrderToOpenOrThrow(...args),
  moveOrderToPaidOrThrow: (...args: unknown[]) =>
    mockMoveOrderToPaidOrThrow(...args),
  moveOrderToPendingTransactionOrThrow: (...args: unknown[]) =>
    mockMoveOrderToPendingTransactionOrThrow(...args),
}));

describe('transaction actions', () => {
  const order = fakeOrder();
  const transaction = fakeTransaction();
  const checkoutId = 'checkoutId123';
  const transactionWithCheckout: Transaction = {
    ...transaction,
    squareCheckout: {
      checkoutId,
    },
  } as Transaction;

  beforeEach(() => {
    mockCancelSquareTerminalCheckout.mockReset();
    mockCreateSquareTerminalCheckout.mockReset();
    mockGetSquareTerminalCheckout.mockReset();

    mockMoveOrderToOpenOrThrow.mockReset();
    mockMoveOrderToPaidOrThrow.mockReset();
    mockMoveOrderToPendingTransactionOrThrow.mockReset();

    prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));
  });

  describe('createTransactionOrThrow', () => {
    it('should create the transaction', async () => {
      mockMoveOrderToPendingTransactionOrThrow.mockResolvedValue(order);
      prismaMock.transaction.create.mockResolvedValue(transaction);
      mockCreateSquareTerminalCheckout.mockResolvedValue({ foo: 'bar' });
      prismaMock.transaction.update.mockResolvedValue(transaction);

      const createdTransaction = await createTransactionOrThrow(order.orderUID);

      expect(prismaMock.transaction.create).toHaveBeenCalledWith({
        data: {
          amountInCents: order.totalInCents,
          order: { connect: { orderUID: order.orderUID } },
          status: TransactionStatus.PENDING,
          transactionType: TransactionType.SQUARE_CHECKOUT,
        },
      });
      expect(mockCreateSquareTerminalCheckout).toHaveBeenCalledWith({
        transaction,
      });
      expect(prismaMock.transaction.update).toHaveBeenCalledWith({
        data: {
          squareCheckout: {
            create: {
              foo: 'bar',
            },
          },
        },
        where: { id: transaction.id },
      });

      expect(createdTransaction).toEqual(transaction);
    });
  });

  describe('createTransaction', () => {
    it('should return the transaction when successful', async () => {
      mockMoveOrderToPendingTransactionOrThrow.mockResolvedValue(order);
      prismaMock.transaction.create.mockResolvedValue(transaction);
      mockCreateSquareTerminalCheckout.mockResolvedValue({ foo: 'bar' });
      prismaMock.transaction.update.mockResolvedValue(transaction);

      expect(await createTransaction('1')).toEqual({
        data: transaction,
        status: 200,
      });
    });

    it('should return error when createTransactionOrThrow throws BadRequestError', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      mockMoveOrderToPendingTransactionOrThrow.mockRejectedValue(
        new BadRequestError('bad input'),
      );

      expect(await createTransaction('1')).toEqual({
        data: null,
        error: {
          message: 'bad input',
          name: BadRequestError.name,
        },
        status: 400,
      });
    });

    it('should return error when createTransactionOrThrow throws NegativeBookQuantityError', async () => {
      const book = fakeBook();
      // kinda hacky, but mocking this function is the simplest solution
      mockMoveOrderToPendingTransactionOrThrow.mockRejectedValue(
        new NegativeBookQuantityError(book),
      );

      expect(await createTransaction('1')).toEqual({
        data: null,
        error: {
          book,
          message: 'Attempting to set a negative quantity for Book',
          name: NegativeBookQuantityError.name,
        },
        status: 400,
      });
    });

    it('should return error when createTransactionOrThrow throws Error', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      mockMoveOrderToPendingTransactionOrThrow.mockRejectedValue(
        new Error('unrecognized error'),
      );

      expect(await createTransaction('1')).toEqual({
        data: null,
        status: 500,
      });
    });
  });

  describe('syncTransactionStatusOrThrow', () => {
    it('should process correctly on completed', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue(
        transactionWithCheckout,
      );
      mockGetSquareTerminalCheckout.mockResolvedValue({
        checkoutId,
        paymentType: 'CARD_PRESENT',
        status: SQUARE_TERMINAL_CHECKOUT_STATUS_COMPLETED,
      });
      prismaMock.transaction.update.mockResolvedValue(transaction);

      const syncedTransaction = await syncTransactionStatusOrThrow(
        transactionWithCheckout.transactionUID,
      );

      expect(mockGetSquareTerminalCheckout).toHaveBeenCalledWith({
        checkoutId,
      });
      expect(prismaMock.transaction.update).toHaveBeenCalledWith({
        data: {
          squareCheckout: {
            update: {
              checkoutId,
              paymentType: 'CARD_PRESENT',
              status: SQUARE_TERMINAL_CHECKOUT_STATUS_COMPLETED,
            },
          },
          status: TransactionStatus.COMPLETE,
        },
        where: { transactionUID: transactionWithCheckout.transactionUID },
      });
      expect(mockMoveOrderToPaidOrThrow).toHaveBeenCalled();
      expect(mockMoveOrderToOpenOrThrow).not.toHaveBeenCalled();
      expect(syncedTransaction).toEqual(transaction);
    });

    it('should process correctly on cancelled', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue(
        transactionWithCheckout,
      );
      mockGetSquareTerminalCheckout.mockResolvedValue({
        checkoutId,
        paymentType: 'CARD_PRESENT',
        status: SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED,
      });
      prismaMock.transaction.update.mockResolvedValue(transaction);

      const syncedTransaction = await syncTransactionStatusOrThrow(
        transactionWithCheckout.transactionUID,
      );

      expect(mockGetSquareTerminalCheckout).toHaveBeenCalledWith({
        checkoutId,
      });
      expect(prismaMock.transaction.update).toHaveBeenCalledWith({
        data: {
          squareCheckout: {
            update: {
              checkoutId,
              paymentType: 'CARD_PRESENT',
              status: SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED,
            },
          },
          status: TransactionStatus.CANCELLED,
        },
        where: { transactionUID: transactionWithCheckout.transactionUID },
      });
      expect(mockMoveOrderToPaidOrThrow).not.toHaveBeenCalled();
      expect(mockMoveOrderToOpenOrThrow).toHaveBeenCalled();
      expect(syncedTransaction).toEqual(transaction);
    });

    it('should be a no-op on pending', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue(
        transactionWithCheckout,
      );
      mockGetSquareTerminalCheckout.mockResolvedValue({
        checkoutId,
        paymentType: 'CARD_PRESENT',
        status: 'PENDING',
      });

      const syncedTransaction = await syncTransactionStatusOrThrow(
        transactionWithCheckout.transactionUID,
      );

      expect(mockGetSquareTerminalCheckout).toHaveBeenCalledWith({
        checkoutId,
      });
      expect(prismaMock.transaction.update).not.toHaveBeenCalledWith();
      expect(syncedTransaction).toEqual(transactionWithCheckout);
    });

    it('should return transaction when transaction status is terminal', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue({
        ...transactionWithCheckout,
        status: TransactionStatus.CANCELLED,
      });

      const syncedTransaction = await syncTransactionStatusOrThrow(
        transactionWithCheckout.transactionUID,
      );

      expect(mockGetSquareTerminalCheckout).not.toHaveBeenCalled();
      expect(prismaMock.transaction.update).not.toHaveBeenCalledWith();
      expect(syncedTransaction).toEqual({
        ...transactionWithCheckout,
        status: TransactionStatus.CANCELLED,
      });
    });

    it('should throw error when transactionType is not Square checkout', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue({
        ...transactionWithCheckout,
        transactionType: 'foo' as TransactionType,
      });

      expect.assertions(2);
      try {
        await syncTransactionStatusOrThrow(
          transactionWithCheckout.transactionUID,
        );
      } catch (err) {
        expect(err instanceof Error).toBeTruthy();
        const error: Error = err as Error;
        expect(error.message).toEqual('Unsupported transactionType: foo');
      }
    });
  });

  describe('syncTransactionStatus', () => {
    it('should return the transaction when successful', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue(
        transactionWithCheckout,
      );
      mockGetSquareTerminalCheckout.mockResolvedValue({
        checkoutId,
        paymentType: 'CARD_PRESENT',
        status: SQUARE_TERMINAL_CHECKOUT_STATUS_COMPLETED,
      });
      prismaMock.transaction.update.mockResolvedValue(transaction);

      expect(await syncTransactionStatus('1')).toEqual({
        data: transaction,
        status: 200,
      });
    });

    it('should return error when syncTransactionStatusOrThrow throws BadRequestError', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      prismaMock.transaction.findUniqueOrThrow.mockRejectedValue(
        new BadRequestError('bad input'),
      );

      expect(await syncTransactionStatus('1')).toEqual({
        data: null,
        error: {
          message: 'bad input',
          name: BadRequestError.name,
        },
        status: 400,
      });
    });

    it('should return error when syncTransactionStatusOrThrow throws Error', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      prismaMock.transaction.findUniqueOrThrow.mockRejectedValue(
        new Error('unrecognized error'),
      );

      expect(await syncTransactionStatus('1')).toEqual({
        data: null,
        status: 500,
      });
    });
  });

  describe('cancelTransactionOrThrow', () => {
    it('should process correctly', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue(
        transactionWithCheckout,
      );
      mockCancelSquareTerminalCheckout.mockResolvedValue({
        checkoutId,
        status: SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED,
      });
      prismaMock.transaction.update.mockResolvedValue(transaction);

      const cancelledTransaction = await cancelTransactionOrThrow(
        transactionWithCheckout.transactionUID,
      );

      expect(mockCancelSquareTerminalCheckout).toHaveBeenCalledWith({
        checkoutId,
      });
      expect(prismaMock.transaction.update).toHaveBeenCalledWith({
        data: {
          squareCheckout: {
            update: {
              checkoutId,
              status: SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED,
            },
          },
          status: TransactionStatus.CANCELLED,
        },
        where: { transactionUID: transactionWithCheckout.transactionUID },
      });
      expect(cancelledTransaction).toEqual(transaction);
    });

    it('should return transaction when transaction status is terminal', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue({
        ...transactionWithCheckout,
        status: TransactionStatus.CANCELLED,
      });

      const cancelledTransaction = await cancelTransactionOrThrow(
        transactionWithCheckout.transactionUID,
      );

      expect(mockCancelSquareTerminalCheckout).not.toHaveBeenCalled();
      expect(prismaMock.transaction.update).not.toHaveBeenCalledWith();
      expect(cancelledTransaction).toEqual({
        ...transactionWithCheckout,
        status: TransactionStatus.CANCELLED,
      });
    });

    it('should throw error when transactionType is not Square checkout', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue({
        ...transactionWithCheckout,
        transactionType: 'foo' as TransactionType,
      });

      expect.assertions(2);
      try {
        await cancelTransactionOrThrow(transactionWithCheckout.transactionUID);
      } catch (err) {
        expect(err instanceof Error).toBeTruthy();
        const error: Error = err as Error;
        expect(error.message).toEqual('Unsupported transactionType: foo');
      }
    });
  });

  describe('cancelTransaction', () => {
    it('should return the transaction when successful', async () => {
      prismaMock.transaction.findUniqueOrThrow.mockResolvedValue(
        transactionWithCheckout,
      );
      mockCancelSquareTerminalCheckout.mockResolvedValue({
        checkoutId,
        status: SQUARE_TERMINAL_CHECKOUT_STATUS_CANCELLED,
      });
      prismaMock.transaction.update.mockResolvedValue(transaction);

      expect(await cancelTransaction('1')).toEqual({
        data: transaction,
        status: 200,
      });
    });

    it('should return error when cancelTransactionOrThrow throws BadRequestError', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      prismaMock.transaction.findUniqueOrThrow.mockRejectedValue(
        new BadRequestError('bad input'),
      );

      expect(await cancelTransaction('1')).toEqual({
        data: null,
        error: {
          message: 'bad input',
          name: BadRequestError.name,
        },
        status: 400,
      });
    });

    it('should return error when cancelTransactionOrThrow throws Error', async () => {
      // kinda hacky, but mocking this function is the simplest solution
      prismaMock.transaction.findUniqueOrThrow.mockRejectedValue(
        new Error('unrecognized error'),
      );

      expect(await cancelTransaction('1')).toEqual({
        data: null,
        status: 500,
      });
    });
  });
});
