import Books from '@/components/Books';
import { randomBookType } from '@/lib/fakes/book';
import type { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof Books> = {
  component: Books,
};

export default meta;
type Story = StoryObj<typeof Books>;

const books = _.times(3, randomBookType);

export const Default: Story = {
  args: {
    books,
  },
};

export const WithNoNextPage: Story = {
  args: {
    books,
    onNext: undefined,
  },
};

export const WithNoPreviousPage: Story = {
  args: {
    books,
    onPrevious: undefined,
  },
};

export const WithNoPagination: Story = {
  args: {
    books,
    onNext: undefined,
    onPrevious: undefined,
  },
};
