import {
  cancelTransactionSafe,
  createTransactionSafe,
  syncTransactionStatusSafe,
} from '@/lib/actions/transaction-safe';
import BadRequestError from '@/lib/errors/BadRequestError';
import NegativeBookQuantityError from '@/lib/errors/NegativeBookQuantityError';
import { fakeBook } from '@/lib/fakes/book';
import { fakeTransaction } from '@/lib/fakes/transaction';

const mockCancelTransaction = jest.fn();
const mockCreateTransaction = jest.fn();
const mockSyncTransactionStatus = jest.fn();
jest.mock('./transaction', () => ({
  ...jest.requireActual('./transaction'),
  cancelTransaction: (...args: unknown[]) => mockCancelTransaction(...args),
  createTransaction: (...args: unknown[]) => mockCreateTransaction(...args),
  syncTransactionStatus: (...args: unknown[]) =>
    mockSyncTransactionStatus(...args),
}));

describe('transaction safe actions', () => {
  const transaction = fakeTransaction();

  beforeEach(() => {
    mockCancelTransaction.mockReset();
    mockCreateTransaction.mockReset();
    mockSyncTransactionStatus.mockReset();
  });

  describe('createTransactionSafe', () => {
    it('should return the transaction when createTransaction is successful', async () => {
      mockCreateTransaction.mockResolvedValue(transaction);
      expect(await createTransactionSafe('1')).toEqual({
        data: transaction,
        status: 200,
      });
    });

    it('should return error when createTransaction throws BadRequestError', async () => {
      mockCreateTransaction.mockRejectedValue(new BadRequestError('bad input'));

      expect(await createTransactionSafe('1')).toEqual({
        data: null,
        error: {
          message: 'bad input',
          name: BadRequestError.name,
        },
        status: 400,
      });
    });

    it('should return error when createTransaction throws NegativeBookQuantityError', async () => {
      const book = fakeBook();
      mockCreateTransaction.mockRejectedValue(
        new NegativeBookQuantityError(book),
      );

      expect(await createTransactionSafe('1')).toEqual({
        data: null,
        error: {
          book,
          message: 'Attempting to set a negative quantity for Book',
          name: NegativeBookQuantityError.name,
        },
        status: 400,
      });
    });

    it('should return error when createTransaction throws Error', async () => {
      mockCreateTransaction.mockRejectedValue(new Error('unrecognized error'));

      expect(await createTransactionSafe('1')).toEqual({
        data: null,
        status: 500,
      });
    });
  });

  describe('syncTransactionStatusSafe', () => {
    it('should return the transaction when syncTransactionStatus is successful', async () => {
      mockSyncTransactionStatus.mockResolvedValue(transaction);

      expect(await syncTransactionStatusSafe('1')).toEqual({
        data: transaction,
        status: 200,
      });
    });

    it('should return error when syncTransactionStatus throws BadRequestError', async () => {
      mockSyncTransactionStatus.mockRejectedValue(
        new BadRequestError('bad input'),
      );

      expect(await syncTransactionStatusSafe('1')).toEqual({
        data: null,
        error: {
          message: 'bad input',
          name: BadRequestError.name,
        },
        status: 400,
      });
    });

    it('should return error when syncTransactionStatus throws Error', async () => {
      mockSyncTransactionStatus.mockRejectedValue(
        new Error('unrecognized error'),
      );

      expect(await syncTransactionStatusSafe('1')).toEqual({
        data: null,
        status: 500,
      });
    });
  });

  describe('cancelTransactionSafe', () => {
    it('should return the transaction when cancelTransaction is successful', async () => {
      mockCancelTransaction.mockResolvedValue(transaction);

      expect(await cancelTransactionSafe('1')).toEqual({
        data: transaction,
        status: 200,
      });
    });

    it('should return error when cancelTransaction throws BadRequestError', async () => {
      mockCancelTransaction.mockRejectedValue(new BadRequestError('bad input'));

      expect(await cancelTransactionSafe('1')).toEqual({
        data: null,
        error: {
          message: 'bad input',
          name: BadRequestError.name,
        },
        status: 400,
      });
    });

    it('should return error when cancelTransaction throws Error', async () => {
      mockCancelTransaction.mockRejectedValue(new Error('unrecognized error'));

      expect(await cancelTransactionSafe('1')).toEqual({
        data: null,
        status: 500,
      });
    });
  });
});
