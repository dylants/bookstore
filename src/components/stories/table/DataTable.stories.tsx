import DataTable from '@/components/table/DataTable';
import SortableHeader from '@/components/table/SortableHeader';
import { faker } from '@faker-js/faker';
import { Meta, StoryObj } from '@storybook/react';
import { ColumnDef } from '@tanstack/react-table';
import _ from 'lodash';
import { CheckCircle, XCircle } from 'lucide-react';

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
    header: ({ column }) => <SortableHeader column={column} text="Number" />,
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

export const ClickableWithIdFieldName: Story = {
  render: () => {
    const clickableData: DataTableEntity[] = _.times(9, (index) => {
      return {
        ...fakeDataTableEntity(),
        uid: `${index}-uid`,
      };
    });

    return (
      <div>
        <DataTable
          columns={columns}
          data={clickableData}
          idFieldName={'uid'}
          onClick={(id) => console.log(`clicked ${id}`)}
        />
      </div>
    );
  },
};
ClickableWithIdFieldName.storyName = 'Clckable w/idFieldName';

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
