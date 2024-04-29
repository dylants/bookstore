'use client';

import SelectInventoryAdjustmentReason from '@/app/books/[isbn13]/SelectInventoryAdjustmentReason';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useAppContext from '@/lib/hooks/useAppContext';
import { createInventoryAdjustment } from '@/lib/inventory-adjustment/adjustment';
import BookHydrated from '@/types/BookHydrated';
import { ProductType } from '@prisma/client';
import _ from 'lodash';
import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

type BookInventoryAdjustmentFormInput = {
  quantity?: string;
  reasonId?: number;
};

export default function BookInventoryAdjustment({
  book,
  onInventoryAdjustment,
}: {
  book: BookHydrated;
  onInventoryAdjustment: (updatedBook: BookHydrated) => Promise<void>;
}) {
  const { inventoryAdjustmentReasons } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<BookInventoryAdjustmentFormInput>({
    values: {
      quantity: undefined,
      reasonId: undefined,
    },
  });
  // register these fields as required since we're using external components to render
  register('reasonId', { required: true });

  const onSubmit: SubmitHandler<BookInventoryAdjustmentFormInput> = useCallback(
    async ({ reasonId, quantity }) => {
      if (reasonId && quantity) {
        const updatedBook = await createInventoryAdjustment({
          bookId: book.id,
          productType: ProductType.BOOK,
          reasonId: reasonId,
          updatedQuantity: _.toNumber(quantity),
        });

        reset();
        setIsOpen(false);
        onInventoryAdjustment(updatedBook);
      }
    },
    [book.id, onInventoryAdjustment, reset],
  );

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          reset();
          setIsOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="secondary">Inventory Adjustment</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Inventory Adjustment</DialogTitle>
              <DialogDescription>
                Enter in the correct book quantity
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col flex-1">
                <label htmlFor="quantity" className="text-sm capitalize">
                  Quantity
                </label>
                <Input
                  id="quantity"
                  className="col-span-3"
                  type="number"
                  min={0}
                  variant={errors['quantity'] ? 'error' : 'default'}
                  {...register('quantity', { required: true })}
                />
              </div>
              <SelectInventoryAdjustmentReason
                reasons={inventoryAdjustmentReasons}
                hasError={!!errors.reasonId}
                onSelect={(value) => {
                  setValue('reasonId', value);
                  clearErrors('reasonId');
                }}
                selectedReasonId={getValues('reasonId')}
              />
            </div>
            <div className="flex justify-end mt-5">
              <Button type="submit" isLoading={isSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
