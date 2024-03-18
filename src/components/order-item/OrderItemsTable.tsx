import Dollars from '@/components/Dollars';
import DataTable from '@/components/table/DataTable';
import SortableHeader from '@/components/table/SortableHeader';
import BookHydrated from '@/types/BookHydrated';
import OrderItemHydrated from '@/types/OrderItemHydrated';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

const columns: ColumnDef<OrderItemHydrated>[] = [
  {
    accessorFn: (orderItem) => orderItem.book?.isbn13,
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
    accessorKey: 'productPriceInCents',
    cell: (props) => (
      <div className="text-right">
        <Dollars amountInCents={props.getValue() as number} />
      </div>
    ),
    header: ({ column }) => (
      <SortableHeader column={column} text="Item Price" />
    ),
  },
  {
    accessorKey: 'quantity',
    cell: (props) => (
      <div className="text-right">
        <>{props.getValue()}</>
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Quantity" />,
  },
  {
    accessorKey: 'totalPriceInCents',
    cell: (props) => (
      <div className="text-right">
        <Dollars amountInCents={props.getValue() as number} />
      </div>
    ),
    header: ({ column }) => (
      <SortableHeader column={column} text="Total Price" />
    ),
  },
];

export default function OrderItemsTable({
  orderItems,
  isLoading,
}: {
  orderItems: OrderItemHydrated[];
  isLoading?: boolean;
}) {
  return (
    <DataTable
      columns={columns}
      data={orderItems}
      isLoading={isLoading}
      noDataText="No Order Items found"
    />
  );
}
