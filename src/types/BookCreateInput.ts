import { Book } from '@prisma/client';

type BookCreateInput = Omit<Book, 'id' | 'publisherId'> & {
  // TODO this should accept IDs rather than strings
  authors: string;
  publisher: string;
};
export default BookCreateInput;
