'use client';

import Books from '@/components/book/Books';
import Search, { SearchFormInput } from '@/components/search/Search';
import { Separator } from '@/components/ui/separator';
import { findBooksBySearchString } from '@/lib/actions/book';
import BookHydrated from '@/types/BookHydrated';
import { useEffect, useRef, useState } from 'react';

export default function SearchPage() {
  const [books, setBooks] = useState<Array<BookHydrated>>();
  const [isSearching, setIsSearching] = useState(false);

  const onSearch = async ({ input }: SearchFormInput) => {
    setIsSearching(true);
    const books = await findBooksBySearchString(input);
    setBooks(books);
    setIsSearching(false);
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
      <h1 className="my-4">Search</h1>
      <Separator className="mt-4 mb-8" />

      <Search
        onSubmit={onSearch}
        isSearching={isSearching}
        ref={inputElement}
      />
      <div className="my-8">
        {books && (
          <>
            {books.length === 0 ? (
              <p>No books found</p>
            ) : (
              // TODO implement pagination
              <Books books={books} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
