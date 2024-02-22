import BookSkeleton from '@/components/book/BookSkeleton';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BookSkeleton> = {
  component: BookSkeleton,
};

export default meta;
type Story = StoryObj<typeof BookSkeleton>;

export const Default: Story = {
  args: {},
};
Default.storyName = 'BookSkeleton';
