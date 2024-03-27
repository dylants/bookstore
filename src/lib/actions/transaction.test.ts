import { fakeOrder } from '@/lib/fakes/order';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeTransaction } from '@/lib/fakes/transaction';
import {
  createTransactionOrThrow,
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

const mockCreateSquareTerminalCheckout = jest.fn();
const mockGetSquareTerminalCheckout = jest.fn();
jest.mock('../square-terminal-checkout', () => ({
  ...jest.requireActual('../square-terminal-checkout'),
  createSquareTerminalCheckout: (...args: unknown[]) =>
    mockCreateSquareTerminalCheckout(...args),
  getSquareTerminalCheckout: (...args: unknown[]) =>
    mockGetSquareTerminalCheckout(...args),
}));

describe('transaction actions', () => {
  const order = fakeOrder();
  const transaction = fakeTransaction();

  beforeEach(() => {
    mockCreateSquareTerminalCheckout.mockReset();
    mockGetSquareTerminalCheckout.mockReset();

    prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));
  });

  describe('createTransactionOrThrow', () => {
    it('should create the transaction', async () => {
      prismaMock.order.findFirstOrThrow.mockResolvedValue(order);
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

  describe('syncTransactionStatusOrThrow', () => {
    const checkoutId = 'checkoutId123';
    const transactionWithCheckout: Transaction = {
      ...transaction,
      squareCheckout: {
        checkoutId,
      },
    } as Transaction;

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
});
