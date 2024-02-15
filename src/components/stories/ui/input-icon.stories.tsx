import { InputIcon } from '@/components/ui/input-icon';
import { Meta, StoryObj } from '@storybook/react';
import { SearchIcon } from 'lucide-react';

const meta: Meta<typeof InputIcon> = {
  args: {
    Icon: <SearchIcon width={20} height={20} />,
  },
  component: InputIcon,
};

export default meta;
type Story = StoryObj<typeof InputIcon>;

export const Default: Story = {
  args: {},
};

export const AsButton: Story = {
  args: {
    asButton: true,
    onClick: () => console.log('clicked!'),
  },
};

export const ButtonDisabled: Story = {
  args: {
    Icon: <SearchIcon width={20} height={20} color="gray" />,
    asButton: true,
    buttonDisabled: true,
    onClick: () => console.log('clicked!'),
  },
};

export const HasError: Story = {
  args: {
    hasError: true,
  },
};
