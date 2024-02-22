import { Separator } from '@/components/ui/separator';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Separator> = {
  component: Separator,
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => {
    return (
      <div>
        <h1 className="my-4">Separator</h1>
        <Separator className="mt-4 mb-8" />
        <div className="flex h-5 items-center space-x-4">
          <div>Left</div>
          <Separator orientation="vertical" />
          <div>Middle</div>
          <Separator orientation="vertical" />
          <div>Right</div>
        </div>
      </div>
    );
  },
};
