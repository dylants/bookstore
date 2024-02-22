import BookHydrated from '@/types/BookHydrated';
import { InvoiceItem } from '@prisma/client';

type InvoiceItemHydrated = InvoiceItem & {
  book: BookHydrated;
};
export default InvoiceItemHydrated;
