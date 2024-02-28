'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { createInvoiceItem } from '@/lib/actions/invoice-item';
import {
  convertDollarsToCents,
  determineDiscountedAmountInCents,
} from '@/lib/money';
import { googleBookSearch } from '@/lib/search/google';
import BookCreateInput from '@/types/BookCreateInput';
import BookFormInput from '@/types/BookFormInput';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import InvoiceItemCreateInput from '@/types/InvoiceItemCreateInput';
import { Format, Genre } from '@prisma/client';
import { ReloadIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
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
        const book = await googleBookSearch({ isbn13: input });
        setLookupBook(book);
        resetSearchSubmit();
        setIsSearching(false);
      }
      setIsOpen(true);
    },
    [resetSearchSubmit],
  );

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<BookFormInput>({
    values: {
      authors: lookupBook?.authors || '',
      format: '',
      genre: lookupBook?.genre || '',
      imageUrl: lookupBook?.imageUrl || '',
      isbn13: lookupBook?.isbn13 || '',
      priceInCents: '',
      publishedDate: lookupBook?.publishedDate
        ? format(
            zonedTimeToUtc(
              lookupBook.publishedDate,
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            ),
            'yyyy-MM-dd',
          )
        : '',
      publisher: lookupBook?.publisher || '',
      // default the quantity to 1 to help speed the flow up
      quantity: '1',
      title: lookupBook?.title || '',
    },
  });

  const onBookSubmit: SubmitHandler<BookFormInput> = useCallback(
    async (bookFormInput) => {
      if (invoice) {
        const book: BookCreateInput = {
          ...bookFormInput,
          // TODO fixme
          format: Format.HARDCOVER,
          // TODO fixme
          genre: Genre.FANTASY,
          isbn13: BigInt(bookFormInput.isbn13),
          // the user assumes they are entering in dollars, so convert to cents
          priceInCents: convertDollarsToCents(bookFormInput.priceInCents),
          publishedDate: new Date(bookFormInput.publishedDate),
          // TODO we need to lookup the value from our database
          quantity: 0,
        };

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
    [invoice, onCreateInvoiceItem, reset],
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
                <BookFormInputField
                  errors={errors}
                  fieldName="genre"
                  register={register}
                />
                <BookFormInputField
                  errors={errors}
                  fieldName="format"
                  register={register}
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
