"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import useIsbnSearch, { Book, IsbnSearchInput } from "@/app/useIsbnSearch";

interface BookQueryFormInput extends IsbnSearchInput {}

export default function BookQuery() {
  const search = useIsbnSearch();
  const [book, setBook] = useState<Book | null>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookQueryFormInput>();
  const onSubmit: SubmitHandler<BookQueryFormInput> = async (data) => {
    const book = await search(data);
    setBook(book);
    reset();
  };

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-1 items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          className="border rounded-sm w-[200px]"
          placeholder="Enter ISBN number..."
          type="text"
          {...register("ISBN", { required: true })}
        />
        {errors.ISBN && <span>This field is required</span>}

        <input
          className="border rounded-md bg-slate-100 w-[100px]"
          type="submit"
          value="Search"
        />
      </form>
      <div>
        <div>ISBN: {book?.ISBN}</div>
        <div>Title: {book?.title}</div>
        <div>Author: {book?.author}</div>
        {book?.imageUrl && (
          <Image
            alt={book?.title}
            src={book?.imageUrl}
            width={128}
            height={192}
          />
        )}
      </div>
    </div>
  );
}
