"use client";

import { useState } from "react";
import {
  FieldErrors,
  SubmitHandler,
  UseFormRegister,
  useForm,
} from "react-hook-form";
import clsx from "clsx";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useIsbnSearch from "@/components/useIsbnSearch";
import { Book as BookType } from "@/types/Book";

interface AddBookFormInput extends Omit<BookType, "publishedDate"> {
  publishedDate: Date | string;
}

function AddBookFormInput({
  errors,
  fieldName,
  register,
}: {
  errors: FieldErrors<AddBookFormInput>;
  fieldName: keyof AddBookFormInput;
  register: UseFormRegister<AddBookFormInput>;
}) {
  const fieldNameToDisplay =
    fieldName === "publishedDate" ? "Published Date" : fieldName;

  return (
    <div className="flex flex-col flex-1">
      <label className="text-sm text-slate-600 capitalize">
        {fieldNameToDisplay}
      </label>
      <Input
        className={clsx(errors[fieldName] && "border-red-500")}
        type="text"
        {...register(fieldName, { required: true })}
      />
    </div>
  );
}

export default function AddBookPage() {
  const [lookupBook, setLookupBook] = useState<BookType | null>();
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
  } = useForm<AddBookFormInput>({
    values: {
      ISBN: lookupBook?.ISBN || "",
      author: lookupBook?.author || "",
      genre: lookupBook?.genre || "",
      imageUrl: lookupBook?.imageUrl,
      publishedDate: lookupBook?.publishedDate || "",
      publisher: lookupBook?.publisher || "",
      title: lookupBook?.title || "",
    },
  });
  const search = useIsbnSearch();

  const onSubmit: SubmitHandler<AddBookFormInput> = async (data) => {
    // TODO add the book
    console.log(data);
    reset();
    setLookupBook(null);
  };

  const onLookup = async () => {
    const isbn = getValues("ISBN");
    if (isbn) {
      const book = await search({ ISBN: isbn });
      // TODO loading spinner while we search
      setLookupBook(book);
    }
  };

  return (
    <div>
      <h1 className="text-2xl text-slate-900 my-4">Add Book</h1>

      <form
        className="flex flex-col p-4 bg-slate-200"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex gap-4 items-end">
          <AddBookFormInput
            errors={errors}
            fieldName="ISBN"
            register={register}
          />
          <Button variant="secondary" type="button" onClick={() => onLookup()}>
            Lookup via ISBN
          </Button>
        </div>

        <hr className="mt-4 mb-3 border-slate-400" />

        <div className="flex gap-4 mt-4">
          <div className="flex">
            {lookupBook?.imageUrl ? (
              <Image
                alt={lookupBook?.title}
                src={lookupBook?.imageUrl}
                width={128}
                height={192}
              />
            ) : (
              <div className="border rounded-sm border-slate-400 w-[128px] h-[192px] flex justify-center items-center text-slate-900">
                No Image
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1 gap-3">
            <AddBookFormInput
              errors={errors}
              fieldName="title"
              register={register}
            />
            <AddBookFormInput
              errors={errors}
              fieldName="author"
              register={register}
            />
            <AddBookFormInput
              errors={errors}
              fieldName="genre"
              register={register}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <AddBookFormInput
            errors={errors}
            fieldName="publishedDate"
            register={register}
          />
          <AddBookFormInput
            errors={errors}
            fieldName="publisher"
            register={register}
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button type="submit">Add Book</Button>
        </div>
      </form>
    </div>
  );
}
