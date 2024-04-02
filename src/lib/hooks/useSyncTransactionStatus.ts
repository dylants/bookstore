'use client';

import { syncTransactionStatus } from '@/lib/actions/transaction';
import { TransactionStatus } from '@prisma/client';
import { useCallback, useState } from 'react';

export const DEFAULT_DELAY = 3000;

export type UseSyncTransactionStatusProps = {
  delay?: number;
  transactionUID: string;
};

export type UseSyncTransactionStatusResult = {
  getTransactionStatus: () => TransactionStatus | null;
  subscribe: () => () => void;
};

export default function useSyncTransactionStatus({
  delay = DEFAULT_DELAY,
  transactionUID,
}: UseSyncTransactionStatusProps): UseSyncTransactionStatusResult {
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus | null>(null);
  const subscribe = useCallback(() => {
    const intervalId = setInterval(async () => {
      const { data, error, status } =
        await syncTransactionStatus(transactionUID);
      if (status === 200 && data) {
        const { status: updatedStatus } = data;
        setTransactionStatus(updatedStatus);
      } else {
        // TODO handle error
        console.error(error);
      }
    }, delay);

    return () => {
      clearInterval(intervalId);
    };
  }, [delay, transactionUID]);

  return {
    getTransactionStatus: () => transactionStatus,
    subscribe,
  };
}
