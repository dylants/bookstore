/**
 * @jest-environment jsdom
 */

import useSyncTransactionStatus, {
  DEFAULT_DELAY,
} from '@/lib/hooks/useSyncTransactionStatus';
import { TransactionStatus } from '@prisma/client';
import { act, renderHook } from '@testing-library/react';

const mockSyncTransactionStatusSafe = jest.fn();
jest.mock('../actions/transaction-safe', () => ({
  syncTransactionStatusSafe: (...args: unknown[]) =>
    mockSyncTransactionStatusSafe(...args),
}));

describe('useSyncTransactionStatus', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockSyncTransactionStatusSafe.mockReset();
  });

  it('should update sync status correctly', async () => {
    const { result } = renderHook(() =>
      useSyncTransactionStatus({ transactionUID: 'abc123' }),
    );

    expect(result.current.getTransactionStatus()).toEqual(null);

    const unsubscribe = result.current.subscribe();
    expect(unsubscribe).toBeDefined();

    // verify that when the status is PENDING, and we advance time,
    // we see the updated state
    mockSyncTransactionStatusSafe.mockReturnValue({
      data: { status: TransactionStatus.PENDING },
      status: 200,
    });
    await act(async () => {
      jest.advanceTimersByTime(DEFAULT_DELAY);
    });
    expect(result.current.getTransactionStatus()).toEqual(
      TransactionStatus.PENDING,
    );

    // verify that when the state changes, and we advance time,
    // we see the updated state
    mockSyncTransactionStatusSafe.mockReturnValue({
      data: { status: TransactionStatus.COMPLETE },
      status: 200,
    });
    await act(async () => {
      jest.advanceTimersByTime(DEFAULT_DELAY);
    });
    expect(result.current.getTransactionStatus()).toEqual(
      TransactionStatus.COMPLETE,
    );

    // verify that when the state changes, but we have unsubscribed,
    // we do NOT see the updated state
    unsubscribe();
    mockSyncTransactionStatusSafe.mockReturnValue({
      data: { status: TransactionStatus.CANCELLED },
      status: 200,
    });
    await act(async () => {
      jest.advanceTimersByTime(DEFAULT_DELAY);
    });
    expect(result.current.getTransactionStatus()).toEqual(
      TransactionStatus.COMPLETE,
    );
  });

  it('should honor the delay parameter', async () => {
    const { result } = renderHook(() =>
      useSyncTransactionStatus({ delay: 5000, transactionUID: 'abc123' }),
    );

    expect(result.current.getTransactionStatus()).toEqual(null);

    result.current.subscribe();

    mockSyncTransactionStatusSafe.mockReturnValue({
      data: { status: TransactionStatus.COMPLETE },
      status: 200,
    });

    // advance by an amount less than the delay
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.getTransactionStatus()).toEqual(null);

    // advance by more, totaling more than the delay
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(result.current.getTransactionStatus()).toEqual(
      TransactionStatus.COMPLETE,
    );
  });

  it('should skip updates on error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useSyncTransactionStatus({ transactionUID: 'abc123' }),
    );

    expect(result.current.getTransactionStatus()).toEqual(null);

    result.current.subscribe();

    mockSyncTransactionStatusSafe.mockReturnValue({
      data: { status: TransactionStatus.COMPLETE },
      error: 'bad things!',
      status: 500,
    });

    // advance by more, totaling more than the delay
    await act(async () => {
      jest.advanceTimersByTime(DEFAULT_DELAY);
    });
    expect(result.current.getTransactionStatus()).toEqual(null);
  });
});
