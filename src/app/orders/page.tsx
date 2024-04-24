'use client';

import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import OrdersTable from '@/components/order/OrdersTable';
import { getOrders } from '@/lib/actions/order';
import { DEFAULT_LIMIT } from '@/lib/pagination';
import OrderHydrated from '@/types/OrderHydrated';
import PageInfo from '@/types/PageInfo';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Array<OrderHydrated> | null>();
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();

  const initialLoad = useCallback(async () => {
    const { orders, pageInfo } = await getOrders({
      paginationQuery: {
        first: DEFAULT_LIMIT,
      },
    });
    setOrders(orders);
    setPageInfo(pageInfo);
  }, []);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  // Delay the loading animation a tiny amount to avoid screen flicker for quick connections (localhost)
  const setDelayedLoading = useCallback(() => {
    const timeout = setTimeout(() => setIsLoading(true), 50);
    return () => {
      setIsLoading(false);
      clearTimeout(timeout);
    };
  }, []);

  const onNext = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    const { orders: newOrders, pageInfo: newPageInfo } = await getOrders({
      paginationQuery: {
        after: pageInfo?.endCursor,
        first: DEFAULT_LIMIT,
      },
    });
    setOrders(newOrders);
    setPageInfo(newPageInfo);
    doneLoading();
  }, [pageInfo, setDelayedLoading]);

  const onPrevious = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    const { orders: newOrders, pageInfo: newPageInfo } = await getOrders({
      paginationQuery: {
        before: pageInfo?.startCursor,
        last: DEFAULT_LIMIT,
      },
    });
    setOrders(newOrders);
    setPageInfo(newPageInfo);
    doneLoading();
  }, [pageInfo, setDelayedLoading]);

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsText>Orders</BreadcrumbsText>
      </Breadcrumbs>

      <h1 className="mt-8">Orders</h1>

      <div className="mt-4">
        <OrdersTable
          orders={orders || []}
          isLoading={!orders || isLoading}
          linkPathname={pathname}
          onNext={pageInfo?.hasNextPage ? onNext : undefined}
          onPrevious={pageInfo?.hasPreviousPage ? onPrevious : undefined}
        />
      </div>
    </>
  );
}
