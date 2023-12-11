"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface Book {
  ISBN: string;
  title: string;
  author: string;
}

interface IsbnSearchInput {
  ISBN: string;
}

function useIsbnSearch() {
  const search = ({ ISBN }: IsbnSearchInput): Book | null => {
    return {
      ISBN,
      title: "My book",
      author: "Someone Somewhere",
    };
  };

  return search;
}

interface BookQueryFormInput extends IsbnSearchInput {}

function BookQuery() {
  const search = useIsbnSearch();
  const [book, setBook] = useState<Book | null>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookQueryFormInput>();
  const onSubmit: SubmitHandler<BookQueryFormInput> = (data) => {
    const book = search(data);
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
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen p-2">
      <h1 className="text-lg m-2">bookstore</h1>
      <div className="flex min-h-screen justify-center items-center">
        <BookQuery />
      </div>
    </main>
  );
}
