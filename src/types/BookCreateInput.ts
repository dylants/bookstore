import { Book } from '@prisma/client';

type BookCreateInput = Omit<Book, 'id' | 'publisherId' | 'vendorId'> & {
  // TODO this should accept IDs rather than strings
  authors: string;
  publisher: string;
  vendor: string;
};
export default BookCreateInput;
