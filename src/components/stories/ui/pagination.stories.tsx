import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Input> = {
  args: {
    type: 'text',
  },
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const BothEnabled: Story = {
  render: () => {
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  },
};

export const PreviousDisabled: Story = {
  render: () => {
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious isDisabled />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  },
};

export const NextDisabled: Story = {
  render: () => {
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext isDisabled />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  },
};

export const BothDisabled: Story = {
  render: () => {
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious isDisabled />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext isDisabled />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  },
};
