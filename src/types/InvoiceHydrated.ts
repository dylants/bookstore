import { BookSource, Invoice, InvoiceItem } from '@prisma/client';

type InvoiceHydrated = Invoice & {
  invoiceItems: InvoiceItem[];
  vendor: BookSource;
};
export default InvoiceHydrated;
