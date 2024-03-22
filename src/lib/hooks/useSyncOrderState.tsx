'use client';

import { getOrderState } from '@/lib/actions/order';
import { OrderState } from '@prisma/client';
import { useCallback, useState } from 'react';

export const DEFAULT_DELAY = 3000;

export type UseSyncOrderStateProps = {
  delay?: number;
  orderUID: string;
};

export type UseSyncOrderStateResult = {
  getOrderState: () => OrderState | null;
  subscribe: () => () => void;
};

export default function useSyncOrderState({
  delay = DEFAULT_DELAY,
  orderUID,
}: UseSyncOrderStateProps): UseSyncOrderStateResult {
  const [orderState, setOrderState] = useState<OrderState | null>(null);
  const subscribe = useCallback(() => {
    const intervalId = setInterval(async () => {
      const orderState = await getOrderState(orderUID);
      setOrderState(orderState);
    }, delay);

    return () => {
      clearInterval(intervalId);
    };
  }, [delay, orderUID]);

  return {
    getOrderState: () => orderState,
    subscribe,
  };
}
