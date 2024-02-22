import InvoicesTable from '@/components/invoice/InvoicesTable';
import { fakeInvoiceHydrated } from '@/lib/fakes/invoice';
import { faker } from '@faker-js/faker';
import { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof InvoicesTable> = {
  component: InvoicesTable,
};

export default meta;
type Story = StoryObj<typeof InvoicesTable>;

function getInvoices() {
  return _.times(9, () => fakeInvoiceHydrated(faker.datatype.boolean()));
}

export const Default: Story = {
  render: () => {
    const invoices = getInvoices();

    return (
      <div>
        <InvoicesTable
          invoices={invoices}
          onClick={(id) => {
            const invoice = invoices.find((i) => i.id === id);
            console.log(`clicked invoice number ${invoice?.invoiceNumber}`);
          }}
        />
      </div>
    );
  },
};
