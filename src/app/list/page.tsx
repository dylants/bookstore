'use client';

import { getBooks } from '@/lib/actions/book';
import Books from '@/components/Books';
import { DEFAULT_LIMIT } from '@/lib/pagination';
import { useCallback, useEffect, useState } from 'react';
import Book from '@/types/Book';
import PageInfo from '@/types/PageInfo';
import BookSkeleton from '@/components/BookSkeleton';

export default function ListPage() {
  const [books, setBooks] = useState<Array<Book> | null>();
  const [pageInfo, setPageInfo] = useState<PageInfo>();

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

  const onNext = useCallback(async () => {
    setBooks(null);
    const { books: newBooks, pageInfo: newPageInfo } = await getBooks({
      paginationQuery: {
        after: pageInfo?.endCursor,
        first: DEFAULT_LIMIT,
      },
    });
    setBooks(newBooks);
    setPageInfo(newPageInfo);
  }, [pageInfo]);

  const onPrevious = useCallback(async () => {
    setBooks(null);
    const { books: newBooks, pageInfo: newPageInfo } = await getBooks({
      paginationQuery: {
        before: pageInfo?.startCursor,
        last: DEFAULT_LIMIT,
      },
    });
    setBooks(newBooks);
    setPageInfo(newPageInfo);
  }, [pageInfo]);

  return (
    <>
      <h1 className="text-2xl text-customPalette-500 my-4">Books</h1>
      <hr className="mt-4 mb-8 border-customPalette-300" />

      {!books || !pageInfo ? (
        <div className="flex flex-col gap-8">
          <BookSkeleton />
          <BookSkeleton />
          <BookSkeleton />
        </div>
      ) : (
        <Books
          books={books}
          onNext={pageInfo.hasNextPage ? onNext : undefined}
          onPrevious={pageInfo.hasPreviousPage ? onPrevious : undefined}
        />
      )}
    </>
  );
}
