'use client';

import Book from '@/components/book/Book';
import BookSkeleton from '@/components/book/BookSkeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import BookHydrated from '@/types/BookHydrated';

export default function Books({
  books,
  isLoading,
  onNext,
  onPrevious,
}: {
  books: Array<BookHydrated>;
  isLoading?: boolean;
  onNext?: () => Promise<void>;
  onPrevious?: () => Promise<void>;
}) {
  return (
    <>
      <div className="flex flex-col gap-8">
        {isLoading ? (
          <>
            <BookSkeleton />
            <BookSkeleton />
            <BookSkeleton />
          </>
        ) : (
          <>
            {books.map((book) => (
              <Book key={book.isbn13} book={book} />
            ))}
          </>
        )}
      </div>
      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={onPrevious ? onPrevious : undefined}
                isDisabled={!onPrevious || isLoading}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={onNext ? onNext : undefined}
                isDisabled={!onNext || isLoading}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
