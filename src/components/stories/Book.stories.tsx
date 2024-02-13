import Book from '@/components/Book';
import { randomBookType } from '@/lib/fakes/book';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Book> = {
  component: Book,
};

export default meta;
type Story = StoryObj<typeof Book>;

export const Default: Story = {
  args: {
    book: randomBookType(),
  },
};
Default.storyName = 'Book';

export const NoImage: Story = {
  args: {
    book: {
      ...randomBookType(),
      imageUrl: null,
    },
  },
};
