import Dollars from '@/components/Dollars';
import DataTable from '@/components/table/DataTable';
import SortableHeader from '@/components/table/SortableHeader';
import {
  determineDiscountPercentage,
  discountPercentageToDisplayString,
} from '@/lib/money';
import BookHydrated from '@/types/BookHydrated';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

const columns: ColumnDef<InvoiceItemHydrated>[] = [
  {
    accessorFn: (invoiceItem) => invoiceItem.book?.isbn13,
    header: ({ column }) => (
      <SortableHeader column={column} text="SKU" className="justify-start" />
    ),
    id: 'isbn',
  },
  {
    accessorFn: (invoiceItem) => invoiceItem.book,
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
    accessorFn: (invoiceItem) => invoiceItem.book?.title,
    header: ({ column }) => (
      <SortableHeader column={column} text="Name" className="justify-start" />
    ),
    id: 'title',
  },
  {
    accessorFn: (invoiceItem) => invoiceItem.book,
    cell: (props) => {
      const book = props.getValue() as BookHydrated | null;

      return (
        <div className="text-right">
          <Dollars amountInCents={book?.priceInCents ?? 0} />
        </div>
      );
    },
    header: ({ column }) => <SortableHeader column={column} text="Price" />,
    id: 'price',
  },
  {
    accessorFn: (invoiceItem) => invoiceItem,
    cell: (props) => {
      const invoiceItem = props.getValue() as InvoiceItemHydrated;

      const discountPercentageToDisplay = invoiceItem.book
        ? discountPercentageToDisplayString(
            determineDiscountPercentage({
              discountedPriceInCents: invoiceItem.itemCostInCents,
              fullPriceInCents: invoiceItem.book.priceInCents,
            }),
          )
        : 'Unknown';

      return <div className="text-right">{discountPercentageToDisplay}</div>;
    },
    header: ({ column }) => <SortableHeader column={column} text="Discount" />,
    id: 'discountPercentage',
  },
  {
    accessorKey: 'itemCostInCents',
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
    accessorKey: 'totalCostInCents',
    cell: (props) => (
      <div className="text-right">
        <Dollars amountInCents={props.getValue() as number} />
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Total" />,
  },
];

export default function InvoiceItemsTable({
  invoiceItems,
  isLoading,
}: {
  invoiceItems: InvoiceItemHydrated[];
  isLoading?: boolean;
}) {
  return (
    <DataTable
      columns={columns}
      data={invoiceItems}
      isLoading={isLoading}
      noDataText="No items found"
    />
  );
}
