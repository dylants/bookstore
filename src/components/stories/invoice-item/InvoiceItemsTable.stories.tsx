import InvoiceItemsTable from '@/components/invoice-item/InvoiceItemsTable';
import { fakeInvoiceItemHydrated } from '@/lib/fakes/invoice-item';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof InvoiceItemsTable> = {
  component: InvoiceItemsTable,
};

export default meta;
type Story = StoryObj<typeof InvoiceItemsTable>;

function getInvoiceItems() {
  return _.times(9, (): InvoiceItemHydrated => {
    const invoiceItem = fakeInvoiceItemHydrated({});
    return Math.random() > 0.2
      ? invoiceItem
      : {
          ...invoiceItem,
          book: {
            ...invoiceItem.book!,
            imageUrl: null,
          },
        };
  });
}

export const Default: Story = {
  render: () => {
    const invoiceItems = getInvoiceItems();

    return (
      <div>
        <InvoiceItemsTable invoiceItems={invoiceItems} />
      </div>
    );
  },
};
