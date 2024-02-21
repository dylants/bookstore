import { BookSource, Invoice } from '@prisma/client';

type InvoiceHydrated = Invoice & {
  numInvoiceItems: number;
  vendor: BookSource;
};
export default InvoiceHydrated;
