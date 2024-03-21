import { Button } from '@/components/ui/button';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  args: {
    children: 'Click me',
    className: 'w-[100px]',
  },
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { variant: 'default' },
};

export const destructive: Story = {
  args: { variant: 'destructive' },
};

export const ghost: Story = {
  args: { variant: 'ghost' },
};

export const link: Story = {
  args: { variant: 'link' },
};

export const outline: Story = {
  args: { variant: 'outline' },
};

export const secondary: Story = {
  args: { variant: 'secondary' },
};

export const loadingDefault: Story = {
  args: { isLoading: true },
};

export const loadingSecondary: Story = {
  args: { isLoading: true, variant: 'secondary' },
};

export const loadingDestructive: Story = {
  args: { isLoading: true, variant: 'destructive' },
};
