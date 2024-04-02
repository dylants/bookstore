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
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { deleteOrder, getOrderWithItems } from '@/lib/actions/order';
import OrderWithItemsHydrated from '@/types/OrderWithItemsHydrated';
import { OrderState } from '@prisma/client';
import Link from 'next/link';
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

  const [isDeleting, setIsDeleting] = useState(false);
  const onDelete = useCallback(async () => {
    setIsDeleting(true);
    const response = await deleteOrder(orderUID);
    if (response.status === 200) {
      router.push('/orders');
    } else {
      // TODO handle errors
      console.error(response.error);
      setIsDeleting(false);
    }
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
        <div className="mt-4 flex justify-end">
          <div className="grid gap-4 grid-cols-2 w-[325px]">
            <Link href={`/checkout?orderUID=${orderUID}`}>
              <Button variant="secondary">Resume Checkout</Button>
            </Link>
            <Button
              variant="destructive"
              isLoading={isDeleting}
              onClick={onDelete}
            >
              Delete Order
            </Button>
          </div>
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
