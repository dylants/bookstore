import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Sheet> = {
  component: Sheet,
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary">Open</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Entity</SheetTitle>
            <SheetDescription>
              Enter the information to create the entity.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col flex-1 py-4">
            <label className="text-sm">Name</label>
            <Input id="name" type="text" />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Create</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  },
};
