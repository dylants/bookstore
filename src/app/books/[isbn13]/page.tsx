'use client';

import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import Book from '@/components/book/Book';
import { getBook } from '@/lib/actions/book';
import { useCallback, useEffect, useState } from 'react';
import BookHydrated from '@/types/BookHydrated';
import BookInventoryAdjustment from '@/app/books/[isbn13]/BookInventoryAdjustment';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function BookPage({ params }: { params: { isbn13: string } }) {
  const { isbn13 } = params;
  const [book, setBook] = useState<BookHydrated>();

  const loadBook = useCallback(async () => {
    const bookLoaded = await getBook(BigInt(isbn13));

    if (!bookLoaded) {
      // TODO handle error
      console.error('Book not found');
    } else {
      setBook(bookLoaded);
    }
  }, [isbn13]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  if (!book) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsText>Books</BreadcrumbsText>
        <BreadcrumbsDivider />
        <BreadcrumbsText>{isbn13}</BreadcrumbsText>
      </Breadcrumbs>

      <div className="mt-8">
        <div className="flex flex-col gap-4">
          <Book book={book} />
          <div className="flex justify-end">
            <BookInventoryAdjustment
              book={book}
              onInventoryAdjustment={async (updatedBook) => {
                setBook(updatedBook);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
