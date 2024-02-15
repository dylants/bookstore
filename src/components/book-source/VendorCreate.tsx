'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

export type VendorCreateFormInput = {
  name: string;
};

export default function VendorCreate({
  onCreate,
}: {
  onCreate: SubmitHandler<VendorCreateFormInput>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<VendorCreateFormInput>();

  const onSubmit = useCallback(
    (data: VendorCreateFormInput) => {
      onCreate(data);
      reset();
      setIsOpen(false);
    },
    [onCreate, reset],
  );

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        reset();
        setIsOpen(open);
      }}
    >
      <SheetTrigger asChild>
        <Button variant="secondary">New Vendor</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Vendor</SheetTitle>
          <SheetDescription>Enter the Vendor details.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col">
            <div className="flex flex-col flex-1 py-4">
              <label className="text-sm">Name</label>
              <Input
                type="text"
                variant={errors.name ? 'error' : 'default'}
                {...register('name', { required: true })}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Create</Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
