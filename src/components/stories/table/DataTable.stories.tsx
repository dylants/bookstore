import DataTable from '@/components/table/DataTable';
import { Button } from '@/components/ui/button';
import { faker } from '@faker-js/faker';
import { Meta, StoryObj } from '@storybook/react';
import { ColumnDef } from '@tanstack/react-table';
import _ from 'lodash';
import { ArrowUpDown, CheckCircle, XCircle } from 'lucide-react';

const meta: Meta<typeof DataTable> = {
  component: DataTable,
};

export default meta;
type Story = StoryObj<typeof DataTable>;

type DataTableEntity = {
  name: string;
  description: string;
  date: Date;
  num: number;
  bool: boolean;
};

const columns: ColumnDef<DataTableEntity>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorFn: (entity) => entity.date.toLocaleDateString(),
    cell: (props) => (
      <div className="text-right">
        <>{props.getValue()}</>
      </div>
    ),
    header: () => <div className="text-right">Date</div>,
    id: 'date',
  },
  {
    accessorKey: 'num',
    cell: (props) => (
      <div className="text-right">
        <>{props.getValue()}</>
      </div>
    ),
    header: ({ column }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: 'bool',
    cell: (props) => {
      const bool = props.getValue();
      return (
        <div className="flex justify-end">
          {bool ? <CheckCircle color="green" /> : <XCircle color="red" />}
        </div>
      );
    },
    header: () => <div className="text-right">Boolean</div>,
  },
];

function fakeDataTableEntity(): DataTableEntity {
  return {
    bool: faker.datatype.boolean(),
    date: faker.date.past(),
    description: faker.lorem.words(),
    name: faker.person.fullName(),
    num: faker.number.int(100),
  };
}

const data: DataTableEntity[] = _.times(9, fakeDataTableEntity);

export const Default: Story = {
  render: () => {
    return (
      <div>
        <DataTable columns={columns} data={data} />
      </div>
    );
  },
};

export const Clickable: Story = {
  render: () => {
    return (
      <div>
        <DataTable
          columns={columns}
          data={data}
          onClick={(id) => console.log(`clicked ${id}`)}
        />
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => {
    return (
      <div>
        <DataTable columns={columns} data={data} isLoading />
      </div>
    );
  },
};

export const NoResults: Story = {
  render: () => {
    return (
      <div>
        <DataTable columns={columns} data={[]} />
      </div>
    );
  },
};
