import DataTable from '@/components/table/DataTable';
import SortableHeader from '@/components/table/SortableHeader';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import { ColumnDef } from '@tanstack/react-table';

function RenderMoney({ value }: { value: number }) {
  return <>${value / 100}</>;
}

const columns: ColumnDef<InvoiceItemHydrated>[] = [
  {
    accessorFn: (invoiceItem) => invoiceItem.book.isbn13,
    header: ({ column }) => (
      <SortableHeader column={column} text="ISBN" className="justify-start" />
    ),
    id: 'isbn',
  },
  {
    accessorFn: (invoiceItem) => invoiceItem.book.title,
    header: ({ column }) => (
      <SortableHeader column={column} text="Title" className="justify-start" />
    ),
    id: 'title',
  },
  {
    accessorFn: (invoiceItem) =>
      invoiceItem.book.authors.map((a) => a.name).join(', '),
    header: ({ column }) => (
      <SortableHeader
        column={column}
        text="Authors"
        className="justify-start"
      />
    ),
    id: 'author',
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
