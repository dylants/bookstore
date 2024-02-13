'use client';

import { useState } from 'react';
import {
  FieldErrors,
  SubmitHandler,
  UseFormRegister,
  useForm,
} from 'react-hook-form';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReloadIcon } from '@radix-ui/react-icons';
import { createBook } from '@/lib/actions/book';
import useExternalBookSearch, {
  ExternalBookSearchResult,
} from '@/lib/search/external/useExternalBookSearch';
import { Format, Genre } from '@prisma/client';

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
  const [lookupBook, setLookupBook] =
    useState<ExternalBookSearchResult | null>();
  const {
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    reset,
  } = useForm<AddBookFormInput>({
    values: {
      // TODO we'll probably want a better UI for these hints...
      authors: lookupBook?.authorsHint || '',
      genre: lookupBook?.genresHint || '',
      imageUrl: lookupBook?.imageUrl || '',
      isbn13: lookupBook?.isbn13 || '',
      publishedDate: lookupBook?.publishedDate?.toLocaleDateString?.() || '',
      publisher: lookupBook?.publisherHint || '',
      title: lookupBook?.title || '',
    },
  });
  const search = useExternalBookSearch();

  const onSubmit: SubmitHandler<AddBookFormInput> = async (book) => {
    await createBook({
      ...book,
      // TODO fixme
      format: Format.HARDCOVER,
      // TODO fixme
      genre: Genre.FANTASY,
      isbn13: BigInt(book.isbn13),
      publishedDate: new Date(book.publishedDate),
      vendor: book.publisher,
    });
    reset();
    setLookupBook(null);

    // TODO add success
  };

  const onLookup = async () => {
    const isbn: string = getValues('isbn13');
    if (isbn) {
      const book = await search({ isbn });
      // TODO loading spinner while we search
      setLookupBook(book);
    }
  };

  return (
    <div>
      <h1 className="text-2xl my-4">Add a Book</h1>
      <hr className="mt-4 mb-8 border-customPalette-300" />

      <form
        className="flex flex-col p-4 border border-customPalette-300"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex gap-4 items-end">
          <AddBookFormInputField
            errors={errors}
            fieldName="isbn13"
            register={register}
          />
          <Button variant="secondary" type="button" onClick={() => onLookup()}>
            Lookup via ISBN
          </Button>
        </div>

        <hr className="mt-4 border-customPalette-300" />

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
              fieldName="authors"
              register={register}
            />
            <AddBookFormInputField
              errors={errors}
              fieldName="genre"
              register={register}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <AddBookFormInputField
            errors={errors}
            fieldName="publishedDate"
            register={register}
          />
          <AddBookFormInputField
            errors={errors}
            fieldName="publisher"
            register={register}
          />
        </div>

        <div className="flex justify-end mt-4">
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
  );
}
