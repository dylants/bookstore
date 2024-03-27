'use client';

import { Button } from '@/components/ui/button';
import { LoadingCircle } from '@/components/ui/loading-circle';
import { cancelOrderToPendingTransaction } from '@/lib/actions/order';
import useSyncOrderState from '@/lib/hooks/useSyncOrderState';
import { OrderState } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

export default function CheckoutTransactionProcessingPage({
  params,
}: {
  params: { uid: string };
}) {
  const orderUID = params.uid;

  // TODO this should sync on the transaction, not the order
  const { getOrderState, subscribe } = useSyncOrderState({
    orderUID,
  });
  const orderState = useSyncExternalStore<OrderState | null>(
    subscribe,
    getOrderState,
  );
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasBeenCancelled, setHasBeenCancelled] = useState(false);

  const router = useRouter();
  const completeUrl = `/checkout/${orderUID}/transaction/complete`;
  const cancelUrl = `/orders/${orderUID}`;

  // prefetch routes for faster navigation
  router.prefetch(completeUrl);
  router.prefetch(cancelUrl);

  useEffect(() => {
    if (orderState === OrderState.PAID) {
      return router.push(completeUrl);
    } else if (orderState === OrderState.OPEN) {
      // if the order state changes to OPEN, assume it's been cancelled
      setHasBeenCancelled(true);
      return router.push(cancelUrl);
    }
  }, [cancelUrl, completeUrl, orderState, router]);

  const onCancel = useCallback(async () => {
    setIsCancelling(true);
    const response = await cancelOrderToPendingTransaction(orderUID);
    if (response.status === 200) {
      return router.push(cancelUrl);
    } else {
      // TODO handle errors
      console.error(response.error);
      setIsCancelling(false);
    }
  }, [cancelUrl, orderUID, router]);

  return (
    <>
      <div className="w-[200px] h-[200px]">
        <LoadingCircle size="xLarge" />
      </div>
      <div>
        {!hasBeenCancelled && !isCancelling && <p>Awaiting transaction...</p>}
        {hasBeenCancelled && <p>Transaction has been cancelled</p>}
        {isCancelling && <p>Cancelling transaction...</p>}
      </div>
      <div className="w-[180px]">
        <Button
          className="w-full"
          variant="destructive"
          isLoading={isCancelling}
          onClick={onCancel}
        >
          Cancel transaction
        </Button>
      </div>
    </>
  );
}
