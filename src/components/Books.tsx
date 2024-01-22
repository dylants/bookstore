import Book from '@/components/Book';
import { Book as BookType } from '@/types/Book';

export default function Books({ books }: { books: Array<BookType> }) {
  return (
    <>
      <div className="flex flex-col gap-8">
        {books.map((book) => (
          <Book key={book.isbn} book={book} />
        ))}
      </div>
    </>
  );
}
