'use client';

import OpenOrderActions from '@/app/orders/[uid]/OpenOrderActions';
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
import { deleteOrder, getOrderWithItems } from '@/lib/actions/order';
import OrderWithItemsHydrated from '@/types/OrderWithItemsHydrated';
import { OrderState } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function OrderPage({ params }: { params: { uid: string } }) {
  const [order, setOrder] = useState<OrderWithItemsHydrated | null>();
  const router = useRouter();

  const orderUID = params.uid;

  const loadOrder = useCallback(async () => {
    const order = await getOrderWithItems(orderUID);
    setOrder(order);
  }, [orderUID]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const onDelete = useCallback(async () => {
    const response = await deleteOrder(orderUID);
    if (response.status === 200) {
      router.push('/orders');
    } else {
      // TODO handle errors
    }
  }, [orderUID, router]);

  const onCheckout = useCallback(async () => {
    router.push(`/checkout?orderUID=${orderUID}`);
  }, [orderUID, router]);

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

      {order.orderState === OrderState.OPEN && (
        <div className="mt-4">
          <OpenOrderActions onCheckout={onCheckout} onDelete={onDelete} />
        </div>
      )}

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
