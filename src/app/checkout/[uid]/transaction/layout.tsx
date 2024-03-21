'use client';

import Dollars from '@/components/Dollars';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getOrder } from '@/lib/actions/order';
import { Order } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

export default function CheckoutTransactionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { uid: string };
}) {
  const [order, setOrder] = useState<Order | null>();

  const orderUID = params.uid;

  const loadOrder = useCallback(async () => {
    const order = await getOrder(orderUID);
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
      {children}
    </div>
  );
}
