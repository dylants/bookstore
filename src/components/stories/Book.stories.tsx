import Book from '@/components/Book';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Book> = {
  component: Book,
};

export default meta;
type Story = StoryObj<typeof Book>;

export const Default: Story = {
  args: {
    book: {
      author: 'Biff Spiffington',
      genre: 'Fiction',
      imageUrl: 'https://picsum.photos/128/192',
      isbn: '123',
      publishedDate: new Date('2000-01-02'),
      publisher: 'My Publisher',
      title: 'My Book',
    },
  },
};
Default.storyName = 'Book';
