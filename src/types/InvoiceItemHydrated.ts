import BookHydrated from '@/types/BookHydrated';
import { Invoice, InvoiceItem } from '@prisma/client';

type InvoiceItemHydrated = InvoiceItem & {
  book: BookHydrated;
  invoice: Invoice;
};
export default InvoiceItemHydrated;
