import Dollars from '@/components/Dollars';
import DataTable from '@/components/table/DataTable';
import SortableHeader from '@/components/table/SortableHeader';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, RefreshCw } from 'lucide-react';

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
    header: ({ column }) => <SortableHeader column={column} text="Qty" />,
  },
  {
    accessorKey: 'subTotalInCents',
    cell: (props) => (
      <div className="text-right">
        <Dollars amountInCents={props.getValue() as number} />
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Subtotal" />,
  },
  {
    accessorKey: 'taxInCents',
    cell: (props) => (
      <div className="text-right">
        <Dollars amountInCents={props.getValue() as number} />
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Tax" />,
  },
  {
    accessorKey: 'totalInCents',
    cell: (props) => (
      <div className="text-right">
        <Dollars amountInCents={props.getValue() as number} />
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Total" />,
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
  linkPathname,
  onNext,
  onPrevious,
}: {
  invoices: InvoiceHydrated[];
  isLoading?: boolean;
  linkPathname: string;
  onNext?: () => Promise<void>;
  onPrevious?: () => Promise<void>;
}) {
  return (
    <DataTable
      columns={columns}
      data={invoices}
      isLoading={isLoading}
      linkPathname={linkPathname}
      noDataText="No Invoices found"
      onNext={onNext}
      onPrevious={onPrevious}
    />
  );
}
