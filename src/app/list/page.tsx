'use client';

import { getBooks } from '@/lib/actions/book';
import Books from '@/components/Books';
import { DEFAULT_LIMIT } from '@/lib/pagination';
import { useCallback, useEffect, useState } from 'react';
import Book from '@/types/Book';
import PageInfo from '@/types/PageInfo';

export default function ListPage() {
  const [books, setBooks] = useState<Array<Book> | null>();
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialLoad = useCallback(async () => {
    const { books, pageInfo } = await getBooks({
      paginationQuery: {
        first: DEFAULT_LIMIT,
      },
    });
    setBooks(books);
    setPageInfo(pageInfo);
  }, []);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  // Delay the loading animation a tiny amount to avoid screen flicker for quick connections (localhost)
  const setDelayedLoading = useCallback(() => {
    const timeout = setTimeout(() => setIsLoading(true), 50);
    return () => {
      setIsLoading(false);
      clearTimeout(timeout);
    };
  }, []);

  const onNext = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    const { books: newBooks, pageInfo: newPageInfo } = await getBooks({
      paginationQuery: {
        after: pageInfo?.endCursor,
        first: DEFAULT_LIMIT,
      },
    });
    setBooks(newBooks);
    setPageInfo(newPageInfo);
    doneLoading();
  }, [pageInfo, setDelayedLoading]);

  const onPrevious = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    const { books: newBooks, pageInfo: newPageInfo } = await getBooks({
      paginationQuery: {
        before: pageInfo?.startCursor,
        last: DEFAULT_LIMIT,
      },
    });
    setBooks(newBooks);
    setPageInfo(newPageInfo);
    doneLoading();
  }, [pageInfo, setDelayedLoading]);

  return (
    <>
      <h1 className="text-2xl text-customPalette-500 my-4">Books</h1>
      <hr className="mt-4 mb-8 border-customPalette-300" />

      <Books
        books={books ?? []}
        isLoading={isLoading || !books}
        onNext={pageInfo?.hasNextPage ? onNext : undefined}
        onPrevious={pageInfo?.hasPreviousPage ? onPrevious : undefined}
      />
    </>
  );
}
