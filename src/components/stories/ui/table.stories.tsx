/* eslint-disable sort-keys */
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Meta, StoryObj } from '@storybook/react';
import { CheckCircle, XCircle } from 'lucide-react';

const meta: Meta<typeof Table> = {
  component: Table,
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => {
    const items = [
      { name: 'Biff', date: new Date('2000/1/2'), color: 'Blue', done: true },
      { name: 'John', date: new Date('2010/6/8'), color: 'Green', done: false },
      { name: 'Jane', date: new Date('2023/10/12'), color: 'Red', done: true },
    ];

    return (
      <>
        <Table>
          <TableCaption>This is the table caption</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Done</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.name}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.date.toLocaleDateString()}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell className="flex justify-end">
                  {item.done ? (
                    <CheckCircle color="green" />
                  ) : (
                    <XCircle color="red" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Footer</TableCell>
              <TableCell className="text-right">Footer Value</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </>
    );
  },
};
