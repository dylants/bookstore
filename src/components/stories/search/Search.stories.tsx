import Search from '@/components/search/Search';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Search> = {
  component: Search,
};

export default meta;
type Story = StoryObj<typeof Search>;

export const Empty: Story = {
  args: {},
};

export const HasError: Story = {
  args: {
    hasError: true,
  },
};

export const IsSearching: Story = {
  args: {
    isSearching: true,
  },
};

export const LabelText: Story = {
  args: {
    labelText: 'ISBN',
  },
};

export const Value: Story = {
  args: {
    value: '123',
  },
};
