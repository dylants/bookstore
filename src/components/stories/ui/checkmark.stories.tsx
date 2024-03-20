import { Checkmark } from '@/components/ui/checkmark';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Checkmark> = {
  component: Checkmark,
};

export default meta;
type Story = StoryObj<typeof Checkmark>;

export const Small: Story = {
  args: { size: 'small' },
};

export const Large: Story = {
  args: { size: 'large' },
};

export const ExtraLarge: Story = {
  args: { size: 'xLarge' },
};

export const DifferentColor: Story = {
  args: { color: '#0044ff', size: 'xLarge' },
};
