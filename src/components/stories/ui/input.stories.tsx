import { Input } from '@/components/ui/input';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Input> = {
  args: {
    type: 'text',
  },
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {},
};

export const Error: Story = {
  args: { variant: 'error' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};
