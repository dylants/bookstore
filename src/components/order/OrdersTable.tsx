import Dollars from '@/components/Dollars';
import DataTable from '@/components/table/DataTable';
import SortableHeader from '@/components/table/SortableHeader';
import OrderHydrated from '@/types/OrderHydrated';
import { OrderState } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<OrderHydrated>[] = [
  {
    accessorKey: 'orderUID',
    header: ({ column }) => (
      <SortableHeader column={column} text="UID" className="justify-start" />
    ),
  },
  {
    accessorKey: 'orderState',
    cell: (props) => (
      <div>
        <>{props.getValue() === OrderState.OPEN ? 'Open' : 'Paid'}</>
      </div>
    ),
    header: ({ column }) => (
      <SortableHeader column={column} text="State" className="justify-start" />
    ),
  },
  {
    accessorFn: (order) => order.orderOpenedDate.toLocaleDateString(),
    cell: (props) => (
      <div className="text-right">
        <>{props.getValue()}</>
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Date" />,
    id: 'opened',
  },
  {
    accessorKey: 'numOrderItems',
    cell: (props) => (
      <div className="text-right">
        <>{props.getValue()}</>
      </div>
    ),
    header: ({ column }) => <SortableHeader column={column} text="Items" />,
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
];

export default function OrdersTable({
  orders,
  isLoading,
  onClick,
}: {
  orders: OrderHydrated[];
  isLoading?: boolean;
  onClick?: (id: string) => void;
}) {
  return (
    <DataTable
      columns={columns}
      data={orders}
      idFieldName={'orderUID'}
      isLoading={isLoading}
      noDataText="No Orders found"
      onClick={(uid) => onClick?.(uid as string)}
    />
  );
}
