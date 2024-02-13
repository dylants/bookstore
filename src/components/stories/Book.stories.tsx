import Book from '@/components/Book';
import { randomBookHydrated } from '@/lib/fakes/book';
import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Book> = {
  component: Book,
};

export default meta;
type Story = StoryObj<typeof Book>;

const book = randomBookHydrated();
// this is necessary until the storybook bug is fixed
// https://github.com/storybookjs/storybook/issues/22452
book.isbn13 = book.isbn13.toString() as unknown as bigint;

export const Default: Story = {
  args: {
    book,
  },
};
Default.storyName = 'Book';

export const NoImage: Story = {
  args: {
    book: {
      ...book,
      imageUrl: null,
    },
  },
};

export const MultipleAuthors: Story = {
  args: {
    book: {
      ...book,
      authors: [
        ...book.authors,
        {
          id: faker.number.int(),
          imageUrl: null,
          name: faker.person.fullName(),
        },
      ],
    },
  },
};
