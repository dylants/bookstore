'use client';

import BookFormSelectFormat from '@/app/invoices/[id]/BookFormSelectFormat';
import BookFormSelectGenre from '@/app/invoices/[id]/BookFormSelectGenre';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createInvoiceItem } from '@/lib/actions/invoice-item';
import { convertDateToFormInputString } from '@/lib/date';
import {
  determineDiscountedAmountInCents,
  discountPercentageDisplayNumberToNumber,
  discountPercentageToDisplayNumber,
} from '@/lib/money';
import { findBookByIsbn13 } from '@/lib/search/book';
import { transformBookFormInputToBookCreateInput } from '@/lib/transformers/book';
import BookCreateInput from '@/types/BookCreateInput';
import BookFormInput from '@/types/BookFormInput';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import InvoiceItemCreateInput from '@/types/InvoiceItemCreateInput';
import { Format, Genre, ProductType } from '@prisma/client';
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
  } else if (fieldName === 'discountPercentageDisplay') {
    fieldNameToDisplay = 'Discount %';
    type = 'number';
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
      <label className="text-sm capitalize">
        {fieldNameToDisplay}
        <Input
          min={0}
          step={type === 'number' ? 'any' : ''}
          type={type}
          variant={errors[fieldName] ? 'error' : 'default'}
          {...register(fieldName, { required: true })}
        />
      </label>
    </div>
  );
}

export default function BookForm({
  formats,
  genres,
  invoice,
  onCreateInvoiceItem,
}: {
  formats: Array<Format>;
  genres: Array<Genre>;
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
  } = useForm<SearchFormInput>({
    values: {
      input: '',
    },
  });
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
      discountPercentageDisplay: discountPercentageToDisplayNumber(
        invoice.vendor.discountPercentage,
      ),
      formatId: lookupBook?.formatId,
      genreId: lookupBook?.genreId,
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
  register('formatId', { required: true });
  register('genreId', { required: true });

  const onBookSubmit: SubmitHandler<BookFormInput> = useCallback(
    async (bookFormInput) => {
      if (invoice) {
        const book: BookCreateInput = transformBookFormInputToBookCreateInput({
          bookFormInput,
          quantity: lookupBook?.quantity,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        const { discountPercentageDisplay } = bookFormInput;
        const discountPercentage = discountPercentageDisplayNumberToNumber(
          discountPercentageDisplay,
        );
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
          productType: ProductType.BOOK,
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
              <label className="text-sm capitalize">
                Scan or Enter SKU
                <Input
                  {...formRest}
                  ref={(e) => {
                    formRef(e);
                    searchRef.current = e;
                  }}
                  type="text"
                  className="w-[300px]"
                />
              </label>
            </div>
            <Button
              variant="default"
              type="submit"
              className="w-[100px]"
              isLoading={isSearching}
            >
              Add Item
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
                <div className="flex flex-[3] gap-4">
                  <BookFormSelectGenre
                    genres={genres}
                    hasError={!!errors.genreId}
                    onSelect={(value) => {
                      setValue('genreId', value);
                      clearErrors('genreId');
                    }}
                    selectedGenreId={getValues('genreId')}
                  />
                  <BookFormSelectFormat
                    formats={formats}
                    hasError={!!errors.formatId}
                    onSelect={(value) => {
                      setValue('formatId', value);
                      clearErrors('formatId');
                    }}
                    selectedFormatId={getValues('formatId')}
                  />
                </div>
                <div className="flex flex-1">
                  <BookFormInputField
                    errors={errors}
                    fieldName="priceInCents"
                    register={register}
                  />
                </div>
              </div>
              <div className="flex flex-1 gap-4">
                <div className="flex flex-1">
                  <BookFormInputField
                    errors={errors}
                    fieldName="publisher"
                    register={register}
                  />
                </div>
                <div className="flex flex-[2] gap-4">
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
                  <BookFormInputField
                    errors={errors}
                    fieldName="discountPercentageDisplay"
                    register={register}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <Button
                autoFocus
                type="submit"
                isLoading={isSubmitting}
                className="w-[100px]"
              >
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
