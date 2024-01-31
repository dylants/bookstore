import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LoadingSpinner> = {
  component: LoadingSpinner,
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  args: {},
};

export const large: Story = {
  args: { size: 'lg' },
};

export const small: Story = {
  args: { size: 'sm' },
};
