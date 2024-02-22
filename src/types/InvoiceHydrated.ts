import BookSourceSerialized from '@/types/BookSourceSerialized';
import { Invoice } from '@prisma/client';

type InvoiceHydrated = Invoice & {
  numInvoiceItems: number;
  vendor: BookSourceSerialized;
};
export default InvoiceHydrated;
