import Dollars from '@/components/Dollars';
import DataTable from '@/components/table/DataTable';
import SortableHeader from '@/components/table/SortableHeader';
import { Input } from '@/components/ui/input';
import {
  determineDiscountPercentage,
  discountPercentageToDisplayNumber,
} from '@/lib/money';
import BookHydrated from '@/types/BookHydrated';
import OrderItemHydrated from '@/types/OrderItemHydrated';
import { useDebounceCallback } from '@react-hook/debounce';
import { ColumnDef } from '@tanstack/react-table';
import _ from 'lodash';
import Image from 'next/image';
import { useState } from 'react';

export type EditableDiscountCallbackProps = {
  discountDisplayNumber: number;
  orderItem: OrderItemHydrated;
};

function buildColumns({
  editableDiscountCallback,
}: {
  editableDiscountCallback?: (
    props: EditableDiscountCallbackProps,
  ) => Promise<void>;
}): ColumnDef<OrderItemHydrated>[] {
  return [
    {
      accessorFn: (orderItem) => orderItem.book?.isbn13,
      header: ({ column }) => (
        <SortableHeader column={column} text="SKU" className="justify-start" />
      ),
      id: 'isbn',
    },
    {
      accessorFn: (orderItem) => orderItem.book,
      cell: (props) => {
        const book = props.getValue() as BookHydrated | null;

        return (
          <div className="flex items-center">
            {book?.imageUrl && (
              <Image
                alt={book.title}
                src={book.imageUrl}
                width={16}
                height={24}
              />
            )}
          </div>
        );
      },
      header: 'Image',
    },
    {
      accessorFn: (orderItem) => orderItem.book?.title,
      header: ({ column }) => (
        <SortableHeader column={column} text="Name" className="justify-start" />
      ),
      id: 'title',
    },
    {
      accessorFn: (orderItem) => orderItem.book?.priceInCents,
      cell: (props) => {
        const priceInCents = props.getValue() as number;

        return (
          <div className="text-right">
            <Dollars amountInCents={priceInCents ?? 0} />
          </div>
        );
      },
      header: ({ column }) => <SortableHeader column={column} text="Price" />,
      id: 'price',
    },
    {
      accessorFn: (orderItem) => {
        const initialDiscountPercentage = orderItem.book
          ? discountPercentageToDisplayNumber(
              determineDiscountPercentage({
                discountedPriceInCents: orderItem.productPriceInCents,
                fullPriceInCents: orderItem.book.priceInCents,
              }),
            )
          : 0;
        return initialDiscountPercentage;
      },
      cell: function Cell(props) {
        const initialDiscountPercentage = props.getValue() as number;

        const [discountDisplayNumber, setDiscountDisplayNumber] = useState<
          number | null
        >(initialDiscountPercentage === 0 ? null : initialDiscountPercentage);

        const updateDiscount = useDebounceCallback(
          async (discount: number) => {
            if (discount > 100) {
              return;
            }

            setDiscountDisplayNumber(discount);
            await editableDiscountCallback?.({
              discountDisplayNumber: discount,
              orderItem: props.row.original,
            });
          },
          // allow time for user input before updating
          800,
        );

        return editableDiscountCallback ? (
          <div className="flex justify-end items-center h-0">
            <Input
              className=" px-[2px] py-0 w-[54px] text-right"
              min={0}
              max={100}
              step="any"
              type="number"
              defaultValue={discountDisplayNumber ?? ''}
              onChange={(e) => updateDiscount(_.toNumber(e.target.value))}
            />
            <span className="pl-[2px]">%</span>
          </div>
        ) : (
          <div className="text-right">{initialDiscountPercentage}%</div>
        );
      },
      header: ({ column }) => (
        <SortableHeader column={column} text="Discount" />
      ),
      id: 'discountPercentage',
    },
    {
      accessorKey: 'productPriceInCents',
      cell: (props) => (
        <div className="text-right">
          <Dollars amountInCents={props.getValue() as number} />
        </div>
      ),
      header: ({ column }) => <SortableHeader column={column} text="Cost" />,
    },
    {
      accessorKey: 'quantity',
      cell: (props) => (
        <div className="text-right">
          <>{props.getValue()}</>
        </div>
      ),
      header: ({ column }) => <SortableHeader column={column} text="Qty" />,
    },
    {
      accessorKey: 'totalPriceInCents',
      cell: (props) => (
        <div className="text-right">
          <Dollars amountInCents={props.getValue() as number} />
        </div>
      ),
      header: ({ column }) => <SortableHeader column={column} text="Total" />,
    },
  ];
}

export default function OrderItemsTable({
  orderItems,
  editableDiscountCallback,
  isLoading,
  tableBodyAdditionalChildren,
}: {
  orderItems: OrderItemHydrated[];
  editableDiscountCallback?: (
    props: EditableDiscountCallbackProps,
  ) => Promise<void>;
  isLoading?: boolean;
  tableBodyAdditionalChildren?: React.ReactNode;
}) {
  return (
    <DataTable
      columns={buildColumns({ editableDiscountCallback })}
      data={orderItems}
      isLoading={isLoading}
      tableBodyAdditionalChildren={tableBodyAdditionalChildren}
    />
  );
}
