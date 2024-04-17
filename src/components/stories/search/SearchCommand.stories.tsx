import SearchCommand, {
  SearchCommandResult,
} from '@/components/search/SearchCommand';
import { fakeBookHydrated } from '@/lib/fakes/book';
import BookHydrated from '@/types/BookHydrated';
import type { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof SearchCommand> = {
  args: {
    onClose: () => {},
    onSearchValueChange: (input) => console.log(input),
    onSelect: (id) => console.log(id),
  },
  component: SearchCommand,
};

export default meta;
type Story = StoryObj<typeof SearchCommand>;

function buildSearchResult(book: BookHydrated): SearchCommandResult {
  const authors = book.authors.map((author) => author.name).join(' ');
  const text = `${book.title} by ${authors}`;

  return {
    id: book.id.toString(),
    imageUrl: book.imageUrl,
    text,
  };
}

const books = _.times(3, () => fakeBookHydrated());
const results = books.map(buildSearchResult);

export const Initial: Story = {
  args: {
    results: null,
    searchValue: '',
  },
};

export const isSearching: Story = {
  args: {
    isSearching: true,
    results: [],
    searchValue: 'search text',
  },
};

export const WithResults: Story = {
  args: {
    results,
    searchValue: 'search text',
  },
};

export const WithoutResults: Story = {
  args: {
    results: [],
    searchValue: 'search text',
  },
};
