import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import InvoiceCreateInput from '@/types/InvoiceCreateInput';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import { Invoice, InvoiceItem, Prisma } from '@prisma/client';

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

async function updateBookQuantity(
  tx: Prisma.TransactionClient,
  invoiceItem: InvoiceItem,
): Promise<void> {
  const { bookId, quantity } = invoiceItem;

  const book = await tx.book.findUniqueOrThrow({
    where: { id: bookId },
  });

  await tx.book.update({
    data: { quantity: book.quantity + quantity },
    where: { id: bookId },
  });
}

export async function completeInvoice(
  invoiceId: Invoice['id'],
): Promise<InvoiceHydrated> {
  const invoiceItems = await prisma.invoiceItem.findMany({
    where: {
      invoiceId: invoiceId,
    },
  });

  return prisma.$transaction(async (tx) => {
    logger.trace('updating books for %d invoice items...', invoiceItems.length);
    await Promise.all(invoiceItems.map((item) => updateBookQuantity(tx, item)));

    logger.trace('marking invoice complete, invoice id: %s', invoiceId);
    const invoice = await tx.invoice.update({
      data: {
        dateReceived: new Date(),
        isCompleted: true,
      },
      include: {
        invoiceItems: true,
        vendor: true,
      },
      where: { id: invoiceId },
    });

    return invoice;
  });
}
