import BookCreateInput from '@/types/BookCreateInput';
import { InvoiceItem } from '@prisma/client';

type InvoiceItemCreateInput = Omit<
  InvoiceItem,
  'id' | 'createdAt' | 'updatedAt' | 'bookId'
> & {
  book: BookCreateInput;
};
export default InvoiceItemCreateInput;
