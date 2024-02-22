import BookSourceSerialized from '@/types/BookSourceSerialized';
import { Author, Book } from '@prisma/client';

type BookHydrated = Book & {
  authors: Author[];
  publisher: BookSourceSerialized;
};
export default BookHydrated;
