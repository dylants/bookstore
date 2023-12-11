"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface Book {
  ISBN: string;
  title: string;
  author: string;
  imageUrl?: string;
}

interface IsbnSearchInput {
  ISBN: string;
}

interface GoogleSearchResponse {
  totalItems: number;
  items: [
    {
      volumeInfo: {
        title: string;
        authors: [string];
        imageLinks: {
          thumbnail: string;
        };
      };
    }
  ];
}

function buildSearchUrl(ISBN: string) {
  return `https://www.googleapis.com/books/v1/volumes?q=isbn:${ISBN}`;
}

function useIsbnSearch() {
  const search = async ({ ISBN }: IsbnSearchInput): Promise<Book | null> => {
    const searchUrl = buildSearchUrl(ISBN);

    const response = await fetch(searchUrl);
    const data: GoogleSearchResponse = await response.json();

    if (data.totalItems > 0) {
      // assume there is only 1 book in the response, since we searched by ISBN
      // which should be unique
      const book = data.items[0];
      const {
        volumeInfo: { title, authors, imageLinks },
      } = book;
      return {
        ISBN,
        title,
        author: authors.join(", "),
        imageUrl: imageLinks.thumbnail,
      };
    } else {
      return null;
    }
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
