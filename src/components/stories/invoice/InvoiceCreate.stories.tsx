import InvoiceCreate from '@/components/invoice/InvoiceCreate';
import { fakeVendor } from '@/lib/fakes/book-source';
import { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof InvoiceCreate> = {
  component: InvoiceCreate,
};

export default meta;
type Story = StoryObj<typeof InvoiceCreate>;

export const Default: Story = {
  render: () => {
    const vendors = _.times(3, fakeVendor);
    return (
      <>
        <InvoiceCreate
          onCreate={(data) => console.log(data)}
          vendors={vendors}
        />
      </>
    );
  },
};
