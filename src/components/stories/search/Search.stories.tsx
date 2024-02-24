import Search from '@/components/search/Search';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Search> = {
  args: {
    onSubmit: () => {},
  },
  component: Search,
};

export default meta;
type Story = StoryObj<typeof Search>;

export const Default: Story = {
  args: {},
};

export const ClearOnSubmit: Story = {
  args: {
    clearOnSubmit: true,
  },
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
