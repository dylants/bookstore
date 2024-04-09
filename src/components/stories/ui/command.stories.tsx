import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CommandDialog> = {
  component: CommandDialog,
};

export default meta;
type Story = StoryObj<typeof CommandDialog>;

export const WithResults: Story = {
  render: () => {
    return (
      <>
        <CommandDialog open={true}>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandItem>One</CommandItem>
            <CommandItem>Two</CommandItem>
            <CommandItem>Three</CommandItem>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
};

export const WithoutResults: Story = {
  render: () => {
    return (
      <>
        <CommandDialog open={true}>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
};
