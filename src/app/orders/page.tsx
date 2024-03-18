'use client';

import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import OrdersTable from '@/components/order/OrdersTable';
import { Button } from '@/components/ui/button';
import { getOrders } from '@/lib/actions/order';
import OrderHydrated from '@/types/OrderHydrated';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Array<OrderHydrated> | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  // Delay the loading animation a tiny amount to avoid screen flicker for quick connections (localhost)
  const setDelayedLoading = useCallback(() => {
    const timeout = setTimeout(() => setIsLoading(true), 50);
    return () => {
      setIsLoading(false);
      clearTimeout(timeout);
    };
  }, []);

  const loadOrders = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    // TODO handle pagination
    const { orders } = await getOrders({
      paginationQuery: {
        first: 100,
      },
    });
    setOrders(orders);
    doneLoading();
  }, [setDelayedLoading]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsText>Orders</BreadcrumbsText>
      </Breadcrumbs>

      <h1 className="mt-8">Orders</h1>
      <div className="flex w-full justify-end mb-4">
        <Button variant="secondary">New Order</Button>
      </div>

      <OrdersTable
        orders={orders || []}
        isLoading={!orders || isLoading}
        onClick={(uid) => router.push(`${pathname}/${uid}`)}
      />
    </>
  );
}
