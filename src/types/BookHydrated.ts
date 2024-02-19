import { Author, Book, BookSource } from '@prisma/client';

type BookHydrated = Book & {
  authors: Author[];
  publisher: BookSource;
};
export default BookHydrated;
