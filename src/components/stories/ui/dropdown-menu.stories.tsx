import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CardStackIcon,
  HamburgerMenuIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DropdownMenu> = {
  component: DropdownMenu,
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <HamburgerMenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <div className="flex items-center">
              <MagnifyingGlassIcon />
              <span className="pl-2">Search</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex items-center">
              <PlusIcon />
              <span className="pl-2">Add</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex items-center">
              <CardStackIcon />
              <span className="pl-2">List</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};
