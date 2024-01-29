'use client';

import Book from '@/components/Book';
import BookSkeleton from '@/components/BookSkeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import BookType from '@/types/Book';

export default function Books({
  books,
  isLoading,
  onNext,
  onPrevious,
}: {
  books: Array<BookType>;
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
              <Book key={book.isbn} book={book} />
            ))}
          </>
        )}
      </div>
      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={onPrevious ? onPrevious : undefined}
                isDisabled={!onPrevious || isLoading}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
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
