'use client';

import { Button } from '@/components/ui/button';
import { LoadingCircle } from '@/components/ui/loading-circle';
import useSyncOrderState from '@/lib/hooks/useSyncOrderState';
import { OrderState } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';

export default function CheckoutTransactionProcessingPage({
  params,
}: {
  params: { uid: string };
}) {
  const orderUID = params.uid;

  const { getOrderState, subscribe } = useSyncOrderState({
    orderUID,
  });
  const orderState = useSyncExternalStore<OrderState | null>(
    subscribe,
    getOrderState,
  );

  const router = useRouter();
  const completeUrl = `/checkout/${orderUID}/transaction/complete`;
  // prefetch this route for faster navigation
  router.prefetch(completeUrl);
  useEffect(() => {
    const isPaid = orderState === OrderState.PAID;
    if (isPaid) {
      router.push(completeUrl);
    }
  }, [completeUrl, orderState, router]);

  return (
    <>
      <div className="w-[200px] h-[200px]">
        <LoadingCircle size="xLarge" />
      </div>
      <div>
        <p>Awaiting transaction...</p>
      </div>
      <div className="w-[180px]">
        <Button className="w-full" variant="destructive">
          Cancel transaction
        </Button>
      </div>
    </>
  );
}
