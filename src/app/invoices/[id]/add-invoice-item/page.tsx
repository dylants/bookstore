'use client';

import {
  Breadcrumbs,
  BreadcrumbsHome,
  BreadcrumbsDivider,
  BreadcrumbsLink,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import Search from '@/components/search/Search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getInvoice } from '@/lib/actions/invoice';
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
import _ from 'lodash';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FieldErrors,
  SubmitHandler,
  UseFormRegister,
  useForm,
} from 'react-hook-form';

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

export default function AddInvoiceItemPage({
  params,
}: {
  params: { id: string };
}) {
  const [invoice, setInvoice] = useState<InvoiceHydrated | null>();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [lookupBook, setLookupBook] = useState<Partial<BookFormInput> | null>();

  // TODO we should validate this input
  const invoiceId = _.toNumber(params.id);

  const loadInvoice = useCallback(async () => {
    const invoice = await getInvoice(invoiceId);
    setInvoice(invoice);
  }, [invoiceId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const inputElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputElement.current && invoice) {
      inputElement.current.focus();
    }
  }, [invoice]);

  const onSearch = useCallback(async ({ input }: { input: string }) => {
    if (input) {
      setIsSearching(true);
      const book = await googleBookSearch({ isbn13: input });
      setLookupBook(book);
      setIsSearching(false);
    }
  }, []);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<BookFormInput>({
    values: {
      authors: lookupBook?.authors || '',
      format: 'Hardcover',
      genre: lookupBook?.genre || '',
      imageUrl: lookupBook?.imageUrl || '',
      isbn13: lookupBook?.isbn13 || '',
      priceInCents: '19.99',
      publishedDate: lookupBook?.publishedDate || '',
      publisher: lookupBook?.publisher || '',
      quantity: '1',
      title: lookupBook?.title || '',
    },
  });

  const onSubmit: SubmitHandler<BookFormInput> = useCallback(
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

        // TODO add success
      }
    },
    [invoice, reset],
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
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsLink href="/invoices">Invoices</BreadcrumbsLink>
        <BreadcrumbsDivider />
        <BreadcrumbsLink href={`/invoices/${invoice.id}`}>
          {invoice.invoiceNumber}
        </BreadcrumbsLink>
        <BreadcrumbsDivider />
        <BreadcrumbsText>New</BreadcrumbsText>
      </Breadcrumbs>

      <h1 className="my-4">New Invoice Item</h1>
      <Search
        isSearching={isSearching}
        labelText="Enter ISBN"
        onSubmit={onSearch}
        ref={inputElement}
      />

      {lookupBook && (
        <>
          <h2 className="mt-4 mb-2">Book</h2>
          <div className="flex flex-col">
            <form onSubmit={handleSubmit(onSubmit)}>
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
                  <BookFormInputField
                    errors={errors}
                    fieldName="publisher"
                    register={register}
                  />
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

              <div className="flex justify-end mt-5">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-[100px]"
                >
                  {isSubmitting ? (
                    <ReloadIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    'Add Book'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
