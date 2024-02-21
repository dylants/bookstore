import { Invoice } from '@prisma/client';

type InvoiceCreateInput = Pick<
  Invoice,
  'invoiceDate' | 'invoiceNumber' | 'vendorId'
>;
export default InvoiceCreateInput;
