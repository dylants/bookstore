'use client';

import { useCallback, useState } from 'react';
import {
  FieldErrors,
  SubmitHandler,
  UseFormRegister,
  useForm,
} from 'react-hook-form';
import Image from 'next/image';
import VendorContainer from '@/app/add/VendorContainer';
import Search from '@/components/search/Search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReloadIcon } from '@radix-ui/react-icons';
import { upsertBook } from '@/lib/actions/book';
import useExternalBookSearch, {
  ExternalBookSearchResult,
} from '@/lib/search/external/useExternalBookSearch';
import { Format, Genre } from '@prisma/client';

const ERROR_KEY_VENDOR = 'vendor';

type AddBookFormInput = {
  authors: string;
  genre: string;
  imageUrl: string;
  isbn13: string;
  publishedDate: string;
  publisher: string;
  title: string;
};

function AddBookFormInputField({
  errors,
  fieldName,
  register,
}: {
  errors: FieldErrors<AddBookFormInput>;
  fieldName: keyof AddBookFormInput;
  register: UseFormRegister<AddBookFormInput>;
}) {
  let fieldNameToDisplay: string = fieldName;
  if (fieldName === 'publishedDate') {
    fieldNameToDisplay = 'Published Date';
  } else if (fieldName === 'isbn13') {
    fieldNameToDisplay = 'ISBN';
  }

  return (
    <div className="flex flex-col flex-1">
      <label className="text-sm capitalize">{fieldNameToDisplay}</label>
      <Input
        type="text"
        variant={errors[fieldName] ? 'error' : 'default'}
        {...register(fieldName, { required: true })}
      />
    </div>
  );
}

export default function AddBookPage() {
  const [vendorId, setVendorId] = useState<number>();
  const [lookupBook, setLookupBook] =
    useState<ExternalBookSearchResult | null>();
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<AddBookFormInput>({
    values: {
      authors: lookupBook?.authorsHint || '',
      genre: lookupBook?.genresHint || '',
      imageUrl: lookupBook?.imageUrl || '',
      isbn13: lookupBook?.isbn13 || '',
      publishedDate: lookupBook?.publishedDate?.toLocaleDateString?.() || '',
      publisher: lookupBook?.publisherHint || '',
      title: lookupBook?.title || '',
    },
  });

  const onSubmit: SubmitHandler<AddBookFormInput> = useCallback(
    async (book) => {
      // TODO fixme
      if (!vendorId) {
        setError(`root.${ERROR_KEY_VENDOR}`, { type: 'required' });
        return;
      }

      await upsertBook({
        ...book,
        // TODO fixme
        format: Format.HARDCOVER,
        // TODO fixme
        genre: Genre.FANTASY,
        isbn13: BigInt(book.isbn13),
        publishedDate: new Date(book.publishedDate),
        // TODO fixme
        quantity: 0,
      });
      reset();
      setLookupBook(null);

      // TODO add success
    },
    [reset, setError, vendorId],
  );

  const onSelectVendor = useCallback(
    (id: number) => {
      // clear any vendor errors with a new value selected
      clearErrors(`root.${ERROR_KEY_VENDOR}`);
      setVendorId(id);
    },
    [clearErrors],
  );

  const search = useExternalBookSearch();
  const onSearch = useCallback(
    async ({ input }: { input: string }) => {
      if (input) {
        setIsSearching(true);
        const book = await search({ isbn: input });
        setLookupBook(book);
        setIsSearching(false);
      }
    },
    [search],
  );

  return (
    <div>
      <h1 className="my-4">Add a Book</h1>
      <hr className="mt-4 mb-8 border-customPalette-300" />

      <VendorContainer
        hasError={!!errors.root?.[ERROR_KEY_VENDOR]}
        onSelect={onSelectVendor}
      />

      <h2 className="mt-4 mb-2">Book</h2>
      <div className="flex flex-col">
        <Search
          hasError={!!errors['isbn13']}
          isSearching={isSearching}
          labelText="ISBN"
          onSubmit={onSearch}
          value={lookupBook?.isbn13 || ''}
        />
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
              <AddBookFormInputField
                errors={errors}
                fieldName="title"
                register={register}
              />
              <AddBookFormInputField
                errors={errors}
                fieldName="publishedDate"
                register={register}
              />
              <AddBookFormInputField
                errors={errors}
                fieldName="imageUrl"
                register={register}
              />
            </div>
          </div>

          <div className="flex flex-col flex-1 gap-4 mt-3">
            <AddBookFormInputField
              errors={errors}
              fieldName="authors"
              register={register}
            />
            <AddBookFormInputField
              errors={errors}
              fieldName="publisher"
              register={register}
            />
          </div>

          <div className="flex justify-end mt-5">
            <Button type="submit" disabled={isSubmitting} className="w-[100px]">
              {isSubmitting ? (
                <ReloadIcon className="h-4 w-4 animate-spin" />
              ) : (
                'Add Book'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
