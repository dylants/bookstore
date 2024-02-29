import DataTable from '@/components/table/DataTable';
import SortableHeader from '@/components/table/SortableHeader';
import BookHydrated from '@/types/BookHydrated';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

function RenderMoney({ value }: { value: number }) {
  return <>${value / 100}</>;
}

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
    accessorKey: 'itemCostInCents',
    cell: (props) => (
      <div className="text-right">
        <RenderMoney value={props.getValue() as number} />
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Item Cost" />,
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
    accessorKey: 'totalCostInCents',
    cell: (props) => (
      <div className="text-right">
        <RenderMoney value={props.getValue() as number} />
      </div>
    ),
    header: ({ column }) => (
      <SortableHeader column={column} text="Total Cost" />
    ),
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
