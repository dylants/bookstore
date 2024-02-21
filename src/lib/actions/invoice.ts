import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import InvoiceCreateInput from '@/types/InvoiceCreateInput';
import InvoiceHydrated from '@/types/InvoiceHydrated';

export async function createInvoice(
  invoice: InvoiceCreateInput,
): Promise<InvoiceHydrated> {
  const { invoiceDate, invoiceNumber, vendorId } = invoice;

  const createdInvoice = await prisma.invoice.create({
    data: {
      invoiceDate,
      invoiceNumber,
      vendorId,
    },
    include: {
      invoiceItems: true,
      vendor: true,
    },
  });

  logger.trace('created invoice in DB: %j', createdInvoice);

  return createdInvoice;
}
