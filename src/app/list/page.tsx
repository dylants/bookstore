'use client';

import { getBooks } from '@/lib/actions/book';
import Books from '@/components/Books';
import { DEFAULT_LIMIT, buildPaginationQuery } from '@/lib/pagination';
import { BookSkeleton } from '@/components/Book';
import { useCallback, useEffect, useState } from 'react';
import Book from '@/types/Book';
import PageInfo from '@/types/PageInfo';

export default function ListPage() {
  const [books, setBooks] = useState<Array<Book> | null>();
  const [pageInfo, setPageInfo] = useState<PageInfo>();

  const initialLoad = useCallback(async () => {
    const paginationQuery = buildPaginationQuery({});
    const { books, pageInfo } = await getBooks({ paginationQuery });
    setBooks(books);
    setPageInfo(pageInfo);
  }, []);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  const onNext = useCallback(async () => {
    setBooks(null);
    const paginationQuery = buildPaginationQuery({
      after: pageInfo?.endCursor,
      first: DEFAULT_LIMIT,
    });
    const { books: newBooks, pageInfo: newPageInfo } = await getBooks({
      paginationQuery,
    });
    setBooks(newBooks);
    setPageInfo(newPageInfo);
  }, [pageInfo]);

  const onPrevious = useCallback(async () => {
    setBooks(null);
    const paginationQuery = buildPaginationQuery({
      before: pageInfo?.startCursor,
      last: DEFAULT_LIMIT,
    });
    const { books: newBooks, pageInfo: newPageInfo } = await getBooks({
      paginationQuery,
    });
    setBooks(newBooks);
    setPageInfo(newPageInfo);
  }, [pageInfo]);

  return (
    <>
      <h1 className="text-2xl text-customPalette-500 my-4">Books</h1>
      <hr className="mt-4 mb-8 border-customPalette-300" />

      {!books ? (
        <div className="flex flex-col gap-8">
          <BookSkeleton />
          <BookSkeleton />
          <BookSkeleton />
        </div>
      ) : (
        <Books books={books} onNext={onNext} onPrevious={onPrevious} />
      )}
    </>
  );
}
