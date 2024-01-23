'use client';

import Books from '@/components/Books';
import SearchForm, { SearchFormParams } from '@/components/SearchForm';
import { findBookBySearchString } from '@/lib/actions/book';
import { Book as BookType } from '@/types/Book';
import { useEffect, useRef, useState } from 'react';

export default function SearchPage() {
  const [books, setBooks] = useState<Array<BookType>>();

  const onSearch: SearchFormParams['onSearch'] = async (searchString) => {
    const books = await findBookBySearchString(searchString);
    setBooks(books);
    return;
  };

  const inputElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  }, []);

  return (
    <div>
      <h1 className="text-2xl text-customPalette-500 my-4">Search</h1>
      <hr className="mt-4 mb-8 border-customPalette-300" />

      <SearchForm onSearch={onSearch} ref={inputElement} />
      <div className="flex my-8">
        {books && (
          <>
            {books.length === 0 ? (
              <p>No books found</p>
            ) : (
              <Books books={books} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
