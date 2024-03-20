'use client';

import Dollars from '@/components/Dollars';
import { Button } from '@/components/ui/button';
import { Checkmark } from '@/components/ui/checkmark';
import { LoadingCircle } from '@/components/ui/loading-circle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getOrderWithItems } from '@/lib/actions/order';
import OrderWithItemsHydrated from '@/types/OrderWithItemsHydrated';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function CheckoutProcessTransactionPage({
  params,
}: {
  params: { uid: string };
}) {
  const [order, setOrder] = useState<OrderWithItemsHydrated | null>();
  const [isComplete, setIsComplete] = useState(false);

  const orderUID = params.uid;

  const loadOrder = useCallback(async () => {
    const order = await getOrderWithItems(orderUID);
    setOrder(order);
  }, [orderUID]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (!order) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // TODO actually complete the order

  return (
    <div className="flex flex-col items-center gap-4 mt-[150px] text-xl text-center">
      <div>
        <p>Order {order.orderUID}</p>
        <p>
          Total:{' '}
          <span className="font-bold">
            <Dollars amountInCents={order.totalInCents} />
          </span>
        </p>
      </div>
      <div className="w-[200px] h-[200px]">
        {!isComplete ? (
          <LoadingCircle
            size="xLarge"
            // TODO delete me -- added for demo purposes
            onClick={() => setIsComplete((v) => !v)}
          />
        ) : (
          <Checkmark
            size="xLarge"
            // TODO delete me -- added for demo purposes
            onClick={() => setIsComplete((v) => !v)}
          />
        )}
      </div>
      <div>
        {!isComplete ? (
          <p>Awaiting transaction...</p>
        ) : (
          <p>Checkout complete!</p>
        )}
      </div>
      <div className="w-[180px]">
        {!isComplete ? (
          <Button className="w-full" variant="destructive">
            Cancel transaction
          </Button>
        ) : (
          <Link href="/checkout">
            <Button className="w-full" variant="default">
              Start New Checkout
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
