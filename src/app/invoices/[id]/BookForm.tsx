'use client';

import BookFormSelectFormat from '@/app/invoices/[id]/BookFormSelectFormat';
import BookFormSelectGenre from '@/app/invoices/[id]/BookFormSelectGenre';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { createInvoiceItem } from '@/lib/actions/invoice-item';
import { convertDateToFormInputString } from '@/lib/date';
import { determineDiscountedAmountInCents } from '@/lib/money';
import { findBookByIsbn13 } from '@/lib/search/book';
import { transformBookFormInputToBookCreateInput } from '@/lib/transformers/book';
import BookCreateInput from '@/types/BookCreateInput';
import BookFormInput from '@/types/BookFormInput';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import InvoiceItemCreateInput from '@/types/InvoiceItemCreateInput';
import { ReloadIcon } from '@radix-ui/react-icons';
import _ from 'lodash';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FieldErrors,
  SubmitHandler,
  UseFormRegister,
  useForm,
} from 'react-hook-form';

type SearchFormInput = {
  input: string;
};

function BookFormInputField({
  errors,
  fieldName,
  register,
}: {
  errors: FieldErrors<BookFormInput>;
  fieldName: keyof BookFormInput;
  register: UseFormRegister<BookFormInput>;
}) {
  let fieldNameToDisplay: string = fieldName;
  let type: string = 'text';
  if (fieldName === 'publishedDate') {
    fieldNameToDisplay = 'Published Date';
    type = 'date';
  } else if (fieldName === 'isbn13') {
    fieldNameToDisplay = 'ISBN';
  } else if (fieldName === 'priceInCents') {
    fieldNameToDisplay = 'Price';
    type = 'number';
  } else if (fieldName === 'quantity') {
    type = 'number';
  }

  return (
    <div className="flex flex-col flex-1">
      <label className="text-sm capitalize">{fieldNameToDisplay}</label>
      <Input
        step={type === 'number' ? 'any' : ''}
        type={type}
        variant={errors[fieldName] ? 'error' : 'default'}
        {...register(fieldName, { required: true })}
      />
    </div>
  );
}

export default function BookForm({
  invoice,
  onCreateInvoiceItem,
}: {
  invoice: InvoiceHydrated;
  onCreateInvoiceItem: () => void;
}) {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [lookupBook, setLookupBook] = useState<Partial<BookFormInput> | null>();
  const [isOpen, setIsOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (searchRef.current && !isOpen) {
      searchRef.current.focus();
    }
  }, [searchRef, isOpen]);

  const {
    handleSubmit: handleSearchSubmit,
    register: registerSearchSubmit,
    reset: resetSearchSubmit,
  } = useForm<SearchFormInput>();
  const { ref: formRef, ...formRest } = registerSearchSubmit('input');

  const onSearch = useCallback(
    async ({ input }: { input: string }) => {
      if (input) {
        setIsSearching(true);
        const book = await findBookByIsbn13({
          isbn13: input,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        setLookupBook(book);
        resetSearchSubmit();
        setIsSearching(false);
      }
      setIsOpen(true);
    },
    [resetSearchSubmit],
  );

  const {
    clearErrors,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<BookFormInput>({
    values: {
      authors: lookupBook?.authors || '',
      format: lookupBook?.format || '',
      genre: lookupBook?.genre || '',
      imageUrl: lookupBook?.imageUrl || '',
      isbn13: lookupBook?.isbn13 || '',
      priceInCents: lookupBook?.priceInCents || '',
      publishedDate: lookupBook?.publishedDate
        ? convertDateToFormInputString(
            lookupBook.publishedDate,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          )
        : '',
      publisher: lookupBook?.publisher || '',
      // default the quantity to 1 to help speed the flow up
      // we don't want to use the book's value, since this is a new invoice
      quantity: '1',
      title: lookupBook?.title || '',
    },
  });

  // register these fields as required since we're using external components to render
  register('format', { required: true });
  register('genre', { required: true });

  const onBookSubmit: SubmitHandler<BookFormInput> = useCallback(
    async (bookFormInput) => {
      if (invoice) {
        const book: BookCreateInput = transformBookFormInputToBookCreateInput({
          bookFormInput,
          quantity: lookupBook?.quantity,
        });

        const { discountPercentage } = invoice.vendor;

        const itemCostInCents = determineDiscountedAmountInCents({
          discountPercentage: discountPercentage ?? 0,
          priceInCents: book.priceInCents,
        });
        const quantity = _.toNumber(bookFormInput.quantity);
        const totalCostInCents = itemCostInCents * quantity;

        const invoiceItem: InvoiceItemCreateInput = {
          book,
          invoiceId: invoice.id,
          itemCostInCents,
          quantity,
          totalCostInCents,
        };

        await createInvoiceItem(invoiceItem);

        reset();
        setLookupBook(null);
        setIsOpen(false);
        onCreateInvoiceItem();
      }
    },
    [lookupBook, invoice, onCreateInvoiceItem, reset],
  );

  if (!invoice) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          reset();
          setLookupBook(null);
          setIsOpen(open);
        }}
      >
        <div className="flex w-full justify-end items-end">
          <form
            className="flex gap-4 items-end"
            onSubmit={handleSearchSubmit(onSearch)}
          >
            <div className="flex flex-col">
              <label className="text-sm capitalize">Scan or Enter ISBN</label>
              <Input
                {...formRest}
                ref={(e) => {
                  formRef(e);
                  searchRef.current = e;
                }}
                type="text"
                className="w-[300px]"
              />
            </div>
            <Button variant="default" type="submit" className="w-[100px]">
              {isSearching ? (
                <ReloadIcon className="h-4 w-4 animate-spin" />
              ) : (
                'Add Item'
              )}
            </Button>
          </form>
        </div>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit(onBookSubmit)}>
            <div className="flex gap-4 mt-4">
              <div className="flex">
                {lookupBook?.imageUrl ? (
                  <Image
                    alt={lookupBook?.title || 'Unknown image'}
                    src={lookupBook?.imageUrl}
                    width={128}
                    height={192}
                  />
                ) : (
                  <div className="border rounded-sm border-customPalette-200 w-[128px] h-[192px] flex justify-center items-center">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 gap-3">
                <BookFormInputField
                  errors={errors}
                  fieldName="isbn13"
                  register={register}
                />
                <BookFormInputField
                  errors={errors}
                  fieldName="title"
                  register={register}
                />
                <BookFormInputField
                  errors={errors}
                  fieldName="authors"
                  register={register}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1 gap-4 mt-3">
              <div className="flex flex-1 gap-4">
                <BookFormSelectGenre
                  hasError={!!errors.genre}
                  onSelect={(value) => {
                    setValue('genre', value);
                    clearErrors('genre');
                  }}
                  selectedGenre={getValues('genre')}
                />
                <BookFormSelectFormat
                  hasError={!!errors.format}
                  onSelect={(value) => {
                    setValue('format', value);
                    clearErrors('format');
                  }}
                  selectedFormat={getValues('format')}
                />
                <BookFormInputField
                  errors={errors}
                  fieldName="priceInCents"
                  register={register}
                />
              </div>
              <div className="flex flex-1 gap-4">
                <div className="flex flex-1">
                  <BookFormInputField
                    errors={errors}
                    fieldName="publisher"
                    register={register}
                  />
                </div>
                <div className="flex flex-1 gap-4">
                  <BookFormInputField
                    errors={errors}
                    fieldName="publishedDate"
                    register={register}
                  />
                  <BookFormInputField
                    errors={errors}
                    fieldName="quantity"
                    register={register}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <Button
                autoFocus
                type="submit"
                disabled={isSubmitting}
                className="w-[100px]"
              >
                {isSubmitting ? (
                  <ReloadIcon className="h-4 w-4 animate-spin" />
                ) : (
                  'Add'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
