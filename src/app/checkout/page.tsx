'use client';

import SkuSearch from '@/app/checkout/SkuInput';
import OrderTotal from '@/app/orders/[uid]/OrderTotal';
import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import OrderItemsTable, {
  EditableDiscountCallbackProps,
} from '@/components/order-item/OrderItemsTable';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { getBook } from '@/lib/actions/book';
import { createOrder, getOrderWithItems } from '@/lib/actions/order';
import { createOrderItem, editOrderItem } from '@/lib/actions/order-item';
import { createTransactionSafe } from '@/lib/actions/transaction-safe';
import {
  determineDiscountedAmountInCents,
  discountPercentageDisplayNumberToNumber,
} from '@/lib/money';
import OrderWithItemsHydrated from '@/types/OrderWithItemsHydrated';
import { ProductType } from '@prisma/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function CheckoutPage() {
  const [order, setOrder] = useState<OrderWithItemsHydrated | null>();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [sku, setSku] = useState<string>('');
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
  }, [
    order,
    orderUID,
    searchRef,
    // include isSearching to reset focus after (invalid) search
    isSearching,
  ]);

  const onSearch = useCallback(
    async ({ input }: { input: string }) => {
      if (input) {
        setIsSearching(true);
        const book = await getBook(BigInt(input));

        let orderUID: string;
        if (!order) {
          const newOrder = await createOrder();
          orderUID = newOrder.orderUID;

          // update the URL to include the orderUID (if not there)
          const params = new URLSearchParams(searchParams.toString());
          if (!params.get('orderUID')) {
            params.set('orderUID', orderUID);
            router.push(`${pathname}?${params.toString()}`);
          }
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
        setSku('');
        setIsSearching(false);
      }
    },
    [order, pathname, router, searchParams],
  );

  const [isCreatingTransaction, setIsCreatingTransaction] =
    useState<boolean>(false);
  const onCreateTransaction = useCallback(async () => {
    if (!orderUID) {
      return;
    }

    setIsCreatingTransaction(true);

    const { data, error, status } = await createTransactionSafe(orderUID);
    if (status === 200 && data) {
      const { transactionUID } = data;
      router.push(
        `/checkout/${orderUID}/transaction/${transactionUID}/processing`,
      );
    } else {
      // TODO handle errors
      console.error(error);
      setIsCreatingTransaction(false);
    }
  }, [orderUID, router]);

  const editableDiscountCallback = useCallback(
    async ({
      discountDisplayNumber,
      orderItem,
    }: EditableDiscountCallbackProps) => {
      if (!orderUID) {
        return;
      }

      const { book, quantity } = orderItem;
      if (!book) {
        // we only handle book types at this time
        return;
      }

      const discountPercentage = discountPercentageDisplayNumberToNumber(
        discountDisplayNumber,
      );
      const productPriceInCents = determineDiscountedAmountInCents({
        discountPercentage: discountPercentage ?? 0,
        priceInCents: book.priceInCents,
      });
      const totalPriceInCents = productPriceInCents * quantity;

      await editOrderItem({
        orderItemId: orderItem.id,
        orderItemUpdate: {
          productPriceInCents,
          quantity,
          totalPriceInCents,
        },
      });

      setOrder(await getOrderWithItems(orderUID));
    },
    [orderUID],
  );

  if (orderUID && !order) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const tableBodyAdditionalChildren = (
    <TableRow className="hover:!bg-transparent">
      <TableCell className="p-0">
        <SkuSearch
          isSearching={isSearching}
          onChange={setSku}
          onSubmit={onSearch}
          ref={searchRef}
          value={sku}
        />
      </TableCell>
      {/* just a big colSpan number here to fill the remaining columns */}
      <TableCell className="p-1" colSpan={100}>
        {isSearching ? <Skeleton className="h-6 w-full" /> : <></>}
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsText>Checkout</BreadcrumbsText>
      </Breadcrumbs>

      <h1 className="mt-8">Checkout</h1>

      <div className="flex flex-col justify-center gap-4 mt-4">
        <div className="flex w-full justify-end items-end">
          <Button
            isLoading={isCreatingTransaction}
            onClick={onCreateTransaction}
            className="w-[100px]"
            disabled={!order}
          >
            Pay Now
          </Button>
        </div>

        <div>
          <div className="mt-4">
            <OrderItemsTable
              orderItems={order ? order.orderItems : []}
              editableDiscountCallback={editableDiscountCallback}
              tableBodyAdditionalChildren={tableBodyAdditionalChildren}
            />
          </div>

          {order && (
            <div className="flex justify-end mt-4">
              <OrderTotal order={order} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
