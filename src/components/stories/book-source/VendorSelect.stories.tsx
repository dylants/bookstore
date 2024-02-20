import VendorSelect from '@/components/book-source/VendorSelect';
import { randomVendor } from '@/lib/fakes/book-source';
import type { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof VendorSelect> = {
  component: VendorSelect,
};

export default meta;
type Story = StoryObj<typeof VendorSelect>;

const vendors = _.times(5, randomVendor);

export const Default: Story = {
  args: {
    vendors,
  },
};

export const HasError: Story = {
  args: {
    hasError: true,
    vendors,
  },
};
