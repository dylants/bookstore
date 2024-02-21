import { Book } from '@prisma/client';

type BookCreateInput = Omit<
  Book,
  'createdAt' | 'updatedAt' | 'id' | 'publisherId'
> & {
  authors: string;
  publisher: string;
};
export default BookCreateInput;
