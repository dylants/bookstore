'use client';

import OrderDescription from '@/app/orders/[uid]/OrderDescription';
import OrderTotal from '@/app/orders/[uid]/OrderTotal';
import {
  Breadcrumbs,
  BreadcrumbsHome,
  BreadcrumbsDivider,
  BreadcrumbsLink,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import OrderItemsTable from '@/components/order-item/OrderItemsTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getOrderWithItems } from '@/lib/actions/order';
import OrderWithItemsHydrated from '@/types/OrderWithItemsHydrated';
import { useCallback, useEffect, useState } from 'react';

export default function OrderPage({ params }: { params: { uid: string } }) {
  const [order, setOrder] = useState<OrderWithItemsHydrated | null>();

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

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsLink href="/orders">Orders</BreadcrumbsLink>
        <BreadcrumbsDivider />
        <BreadcrumbsText>{order.orderUID}</BreadcrumbsText>
      </Breadcrumbs>

      <OrderDescription order={order} />

      <hr className="my-8 mx-8 bg-slate-300" />

      <div className="mt-4">
        <OrderItemsTable orderItems={order.orderItems} />
      </div>

      <div className="flex justify-end mt-4">
        <OrderTotal order={order} />
      </div>
    </>
  );
}
