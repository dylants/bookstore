import DataTable from '@/components/table/DataTable';
import { Button } from '@/components/ui/button';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import { Column, ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import { ArrowDown, ArrowUp, CheckCircle, RefreshCw } from 'lucide-react';

function SortableHeader({
  className,
  column,
  text,
}: {
  className?: string;
  column: Column<InvoiceHydrated>;
  text: string;
}) {
  const sorted = column.getIsSorted();
  const sortIcon = sorted ? (
    <>
      {sorted === 'asc' ? (
        <ArrowUp className="ml-1 h-4 w-4" />
      ) : (
        <ArrowDown className="ml-1 h-4 w-4" />
      )}
    </>
  ) : (
    // this acts as a placeholder for the sort icon
    <div className="ml-1 h-4 w-4"></div>
  );

  return (
    <Button
      variant="ghost"
      className={clsx('flex justify-end w-full px-0', className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {text}
      {sortIcon}
    </Button>
  );
}

const columns: ColumnDef<InvoiceHydrated>[] = [
  {
    accessorFn: (invoice) => invoice.vendor.name,
    header: ({ column }) => (
      <SortableHeader column={column} text="Vendor" className="justify-start" />
    ),
    id: 'vendor',
  },
  {
    accessorKey: 'invoiceNumber',
    cell: (props) => (
      <div className="text-right">
        <>{props.getValue()}</>
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Number" />,
  },
  {
    accessorFn: (invoice) => invoice.invoiceDate.toLocaleDateString(),
    cell: (props) => (
      <div className="text-right">
        <>{props.getValue()}</>
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Date" />,
    id: 'date',
  },
  {
    accessorKey: 'numInvoiceItems',
    cell: (props) => (
      <div className="text-right">
        <>{props.getValue()}</>
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Items" />,
  },
  {
    accessorKey: 'isCompleted',
    cell: (props) => {
      const isCompleted = props.getValue();
      return (
        <div className="flex justify-end">
          {isCompleted ? <CheckCircle color="green" /> : <RefreshCw />}
        </div>
      );
    },
    header: ({ column }) => <SortableHeader column={column} text="Status" />,
  },
];

export default function InvoicesTable({
  invoices,
  isLoading,
  onClick,
}: {
  invoices: InvoiceHydrated[];
  isLoading?: boolean;
  onClick?: (id: number) => void;
}) {
  return (
    <DataTable
      columns={columns}
      data={invoices}
      isLoading={isLoading}
      noDataText="No Invoices found"
      onClick={(id) => onClick?.(id as number)}
    />
  );
}
