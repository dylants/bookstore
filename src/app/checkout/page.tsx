'use client';

import OrderTotal from '@/app/orders/[uid]/OrderTotal';
import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import OrderItemsTable from '@/components/order-item/OrderItemsTable';
import Search from '@/components/search/Search';
import { Button } from '@/components/ui/button';
import { getBook } from '@/lib/actions/book';
import { createOrder, getOrderWithItems } from '@/lib/actions/order';
import { createOrderItem } from '@/lib/actions/order-item';
import OrderWithItemsHydrated from '@/types/OrderWithItemsHydrated';
import { ProductType } from '@prisma/client';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function CheckoutPage() {
  const [order, setOrder] = useState<OrderWithItemsHydrated | null>();
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchRef]);

  const onSearch = useCallback(
    async ({ input }: { input: string }) => {
      if (input) {
        setIsSearching(true);
        const book = await getBook(BigInt(input));

        let orderUID: string;
        if (!order) {
          const newOrder = await createOrder();
          orderUID = newOrder.orderUID;
        } else {
          orderUID = order.orderUID;
        }

        if (book) {
          await createOrderItem({
            bookId: book.id,
            orderUID,
            productType: ProductType.BOOK,
            quantity: 1,
          });
          setOrder(await getOrderWithItems(orderUID));
        }
        setIsSearching(false);
      }
    },
    [order],
  );

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsText>Checkout</BreadcrumbsText>
      </Breadcrumbs>

      <h1 className="mt-8">Checkout</h1>

      <div
        className={clsx(
          'flex flex-col justify-center gap-4',
          order && 'mt-4',
          !order && 'mx-[100px] h-[400px]',
        )}
      >
        <div className="flex gap-16 w-full items-end">
          <div className="flex flex-grow w-full">
            <Search
              onSubmit={onSearch}
              clearOnSubmit
              isSearching={isSearching}
              labelText="SKU"
              ref={searchRef}
            />
          </div>
          {order && (
            <Button variant="secondary" onClick={() => console.log('complete')}>
              Complete Order
            </Button>
          )}
        </div>

        {order ? (
          <>
            <div className="mt-4">
              <OrderItemsTable orderItems={order.orderItems} />
            </div>

            <div className="flex justify-end mt-4">
              <OrderTotal order={order} />
            </div>
          </>
        ) : (
          <p className="text-center">Scan item or enter SKU to begin</p>
        )}
      </div>
    </>
  );
}
