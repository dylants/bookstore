'use client';

import VendorSelect from '@/components/book-source/VendorSelect';
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
import BookSourceSerialized from '@/types/BookSourceSerialized';
import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

export type InvoiceCreateFormInput = {
  invoiceNumber: string;
  invoiceDate: Date;
  vendorId: number;
};

export default function InvoiceCreate({
  onCreate,
  vendors,
}: {
  onCreate: SubmitHandler<InvoiceCreateFormInput>;
  vendors: Array<BookSourceSerialized>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<InvoiceCreateFormInput>();

  // register the vendorId as required since we're using an external component to render
  register('vendorId', { required: true });

  const onSubmit = useCallback(
    (data: InvoiceCreateFormInput) => {
      onCreate({
        ...data,
        invoiceDate: new Date(data.invoiceDate),
      });
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
        <Button variant="secondary">New Invoice</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Invoice</SheetTitle>
          <SheetDescription>Enter the invoice details</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col flex-1">
              <label className="text-sm">Number</label>
              <Input
                type="text"
                placeholder="Invoice number"
                variant={errors.invoiceNumber ? 'error' : 'default'}
                {...register('invoiceNumber', { required: true })}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm">Date</label>
              <Input
                type="date"
                variant={errors.invoiceDate ? 'error' : 'default'}
                {...register('invoiceDate', { required: true })}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm">Vendor</label>
              <VendorSelect
                hasError={!!errors.vendorId}
                onSelect={(id) => {
                  setValue('vendorId', id);
                  clearErrors('vendorId');
                }}
                vendors={vendors}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit">Create</Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
