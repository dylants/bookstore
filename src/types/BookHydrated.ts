import BookSourceSerialized from '@/types/BookSourceSerialized';
import { Author, Book, Format, Genre } from '@prisma/client';

type BookHydrated = Book & {
  authors: Author[];
  format: Format;
  genre: Genre;
  publisher: BookSourceSerialized;
};
export default BookHydrated;
