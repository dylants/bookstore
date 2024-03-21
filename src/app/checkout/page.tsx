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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getBook } from '@/lib/actions/book';
import { createOrder, getOrderWithItems } from '@/lib/actions/order';
import { createOrderItem } from '@/lib/actions/order-item';
import OrderWithItemsHydrated from '@/types/OrderWithItemsHydrated';
import { ProductType } from '@prisma/client';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function CheckoutPage() {
  const [order, setOrder] = useState<OrderWithItemsHydrated | null>();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const orderUID = searchParams.get('orderUID');

  const loadOrder = useCallback(async (orderUID: string) => {
    setOrder(await getOrderWithItems(orderUID));
  }, []);

  useEffect(() => {
    if (orderUID) {
      loadOrder(orderUID);
    } else {
      setOrder(null);
    }
  }, [loadOrder, orderUID]);

  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    // if the orderUID is supplied, we must wait for the order to load
    if (orderUID && !order) {
      return;
    }

    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [order, orderUID, searchRef]);

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

        // update the URL to include the orderUID (if not there)
        // do this last to retain the animations
        const params = new URLSearchParams(searchParams.toString());
        if (!params.get('orderUID')) {
          params.set('orderUID', orderUID);
          router.push(`${pathname}?${params.toString()}`);
        }
      }
    },
    [order, pathname, router, searchParams],
  );

  if (orderUID && !order) {
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
        <BreadcrumbsText>Checkout</BreadcrumbsText>
      </Breadcrumbs>

      <h1 className="mt-8">Checkout</h1>

      <AnimatePresence initial={false}>
        <div
          className={clsx(
            'flex flex-col justify-center gap-4',
            order && 'mt-4',
            !order && 'mx-[100px] h-[400px]',
          )}
        >
          <div className="flex w-full justify-between items-end">
            <motion.div
              layout
              className={clsx(
                'flex',
                order && 'w-[300px]',
                !order && 'flex-grow',
              )}
            >
              <Search
                onSubmit={onSearch}
                clearOnSubmit
                isSearching={isSearching}
                labelText="SKU"
                ref={searchRef}
              />
            </motion.div>
            {order && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                exit={{ opacity: 0 }}
              >
                <Link
                  href={`/checkout/${order.orderUID}/transaction/processing`}
                >
                  <Button>Complete Order</Button>
                </Link>
              </motion.div>
            )}
          </div>

          <div>
            {order ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                exit={{ opacity: 0 }}
              >
                <div className="mt-4">
                  <OrderItemsTable orderItems={order.orderItems} />
                </div>

                <div className="flex justify-end mt-4">
                  <OrderTotal order={order} />
                </div>
              </motion.div>
            ) : (
              <p className="text-center">Scan item or enter SKU to begin</p>
            )}
          </div>
        </div>
      </AnimatePresence>
    </>
  );
}
