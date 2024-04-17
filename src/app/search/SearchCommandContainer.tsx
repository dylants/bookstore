'use client';

import SearchCommand, {
  SearchCommandResult,
} from '@/components/search/SearchCommand';
import { findBooksBySearchString } from '@/lib/actions/book';
import BookHydrated from '@/types/BookHydrated';
import { useDebounceCallback } from '@react-hook/debounce';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

function buildSearchResult(book: BookHydrated): SearchCommandResult {
  const authors = book.authors.map((author) => author.name).join(' ');
  const text = `${book.title} by ${authors}`;

  return {
    id: book.isbn13.toString(),
    imageUrl: book.imageUrl,
    text,
  };
}

export default function SearchCommandContainer() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [results, setResults] = useState<Array<BookHydrated> | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const router = useRouter();

  const onClose = useCallback(() => {
    setResults(null);
    setSearchValue('');
    setIsSearching(false);
  }, []);

  const search = useDebounceCallback(async (searchString) => {
    // short circuit to skip the search
    if (!searchString) {
      setResults(null);
      return;
    }

    setIsSearching(true);
    const books = await findBooksBySearchString(searchString);
    setResults(books);
    setIsSearching(false);
  }, 500);

  const onSearchValueChange = useCallback(
    (updatedSearchValue: string) => {
      setSearchValue(updatedSearchValue);
      search(updatedSearchValue);
    },
    [search],
  );

  const onSelect = useCallback(
    (result: SearchCommandResult) => {
      router.push(`/books/${result.id}`);
      onClose();
    },
    [onClose, router],
  );

  return (
    <SearchCommand
      isSearching={isSearching}
      onClose={onClose}
      onSearchValueChange={onSearchValueChange}
      onSelect={onSelect}
      results={results ? results.map(buildSearchResult) : null}
      searchValue={searchValue}
    />
  );
}
