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
import { getOrder } from '@/lib/actions/order';
import { getOrderItems } from '@/lib/actions/order-item';
import OrderHydrated from '@/types/OrderHydrated';
import OrderItemHydrated from '@/types/OrderItemHydrated';
import { useCallback, useEffect, useState } from 'react';

export default function OrderPage({ params }: { params: { uid: string } }) {
  const [order, setOrder] = useState<OrderHydrated | null>();
  const [orderItems, setOrderItems] =
    useState<Array<OrderItemHydrated> | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const orderUID = params.uid;

  // Delay the loading animation a tiny amount to avoid screen flicker for quick connections (localhost)
  const setDelayedLoading = useCallback(() => {
    const timeout = setTimeout(() => setIsLoading(true), 100);
    return () => {
      setIsLoading(false);
      clearTimeout(timeout);
    };
  }, []);

  const loadOrder = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    const order = await getOrder(orderUID);
    setOrder(order);
    doneLoading();
  }, [orderUID, setDelayedLoading]);

  const loadOrderItems = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    // TODO handle pagination
    const { orderItems } = await getOrderItems({
      orderUID,
      paginationQuery: {
        first: 100,
      },
    });
    setOrderItems(orderItems);
    doneLoading();
  }, [orderUID, setDelayedLoading]);

  useEffect(() => {
    loadOrder();
    loadOrderItems();
  }, [loadOrder, loadOrderItems]);

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
        <OrderItemsTable
          orderItems={orderItems || []}
          isLoading={!orderItems || isLoading}
        />
      </div>

      <div className="flex justify-end mt-4">
        <OrderTotal order={order} />
      </div>
    </>
  );
}
