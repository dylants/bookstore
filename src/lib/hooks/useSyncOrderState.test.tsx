/**
 * @jest-environment jsdom
 */

import useSyncOrderState from '@/lib/hooks/useSyncOrderState';
import { OrderState } from '@prisma/client';
import { act, renderHook } from '@testing-library/react';

const mockGetOrderState = jest.fn();
jest.mock('../actions/order', () => ({
  getOrderState: (...args: unknown[]) => mockGetOrderState(...args),
}));

describe('useSyncOrderState', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockGetOrderState.mockReset();
  });

  it('should return perform correctly', async () => {
    const { result } = renderHook(() =>
      useSyncOrderState({ orderUID: 'abc123' }),
    );

    expect(result.current.getOrderState()).toEqual(null);

    const unsubscribe = result.current.subscribe();
    expect(unsubscribe).toBeDefined();

    // verify that when the state is OPEN, and we advance time,
    // we see the updated state
    mockGetOrderState.mockReturnValue(OrderState.OPEN);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.getOrderState()).toEqual(OrderState.OPEN);

    // verify that when the state changes, and we advance time,
    // we see the updated state
    mockGetOrderState.mockReturnValue(OrderState.PAID);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.getOrderState()).toEqual(OrderState.PAID);

    // verify that when the state changes, but we have unsubscribed,
    // we do NOT see the updated state
    unsubscribe();
    mockGetOrderState.mockReturnValue(OrderState.OPEN);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.getOrderState()).toEqual(OrderState.PAID);
  });

  it('should honor the delay parameter', async () => {
    const { result } = renderHook(() =>
      useSyncOrderState({ delay: 5000, orderUID: 'abc123' }),
    );

    expect(result.current.getOrderState()).toEqual(null);

    result.current.subscribe();

    mockGetOrderState.mockReturnValue(OrderState.OPEN);

    // advance by an amount less than the delay
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.getOrderState()).toEqual(null);

    // advance by more, totaling more than the delay
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(result.current.getOrderState()).toEqual(OrderState.OPEN);
  });
});
