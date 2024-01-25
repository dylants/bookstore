'use client';

import Book from '@/components/Book';
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
  onNext,
  onPrevious,
}: {
  books: Array<BookType>;
  onNext?: () => Promise<void>;
  onPrevious?: () => Promise<void>;
}) {
  return (
    <>
      <div className="flex flex-col gap-8">
        {books.map((book) => (
          <Book key={book.isbn} book={book} />
        ))}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={onPrevious ? onPrevious : undefined}
              isDisabled={!onPrevious}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={onNext ? onNext : undefined}
              isDisabled={!onNext}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
