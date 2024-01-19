"use client";

import { useCallback, useEffect, useState } from "react";
import { Book as BookType } from "@/types/Book";
import { getBooks } from "@/lib/actions";
import Book from "@/components/Book";

export default function ListPage() {
  const [books, setBooks] = useState<Array<BookType>>([]);

  const loadBooks = useCallback(async () => {
    const loadedBooks = await getBooks();
    setBooks(loadedBooks);
  }, [setBooks]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return (
    <>
      <h1 className="text-2xl text-customPalette-500 my-4">Books</h1>
      <hr className="mt-4 mb-8 border-customPalette-300" />
      <div className="flex flex-col gap-8">
        {books.map((book) => (
          <Book key={book.isbn} book={book} />
        ))}
      </div>
    </>
  );
}
