import Books from '@/components/book/Books';
import { fakeBookHydrated } from '@/lib/fakes/book';
import type { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof Books> = {
  component: Books,
};

export default meta;
type Story = StoryObj<typeof Books>;

const books = _.times(3, fakeBookHydrated);
// this is necessary until the storybook bug is fixed
// https://github.com/storybookjs/storybook/issues/22452
books.map((b) => (b.isbn13 = b.isbn13.toString() as unknown as bigint));

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
