import Books from '@/components/Books';
import BookType from '@/types/Book';
import type { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof Books> = {
  component: Books,
};

export default meta;
type Story = StoryObj<typeof Books>;

const randomImage = (): string =>
  `https://picsum.photos/id/${_.random(1, 500)}/128/192`;

const book1: BookType = {
  author: 'Biff Spiffington',
  genre: 'Fiction',
  imageUrl: randomImage(),
  isbn: '123',
  publishedDate: new Date('2000-01-02'),
  publisher: 'My Publisher',
  title: 'My Book',
};

const book2: BookType = {
  author: 'Jane Doe',
  genre: 'Non-Fiction',
  imageUrl: randomImage(),
  isbn: '345',
  publishedDate: new Date('2001-02-03'),
  publisher: 'My Other Publisher',
  title: 'My Book 2',
};

const book3: BookType = {
  author: 'John Doe',
  genre: 'Fiction',
  imageUrl: randomImage(),
  isbn: '567',
  publishedDate: new Date('2002-03-04'),
  publisher: 'That Publisher',
  title: 'My Book 3',
};

export const Default: Story = {
  args: {
    books: [book1, book2, book3],
  },
};

export const WithNoNextPage: Story = {
  args: {
    books: [book1, book2, book3],
    onNext: undefined,
  },
};

export const WithNoPreviousPage: Story = {
  args: {
    books: [book1, book2, book3],
    onPrevious: undefined,
  },
};

export const WithNoPagination: Story = {
  args: {
    books: [book1, book2, book3],
    onNext: undefined,
    onPrevious: undefined,
  },
};
