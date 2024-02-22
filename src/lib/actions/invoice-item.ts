import { upsertBook } from '@/lib/actions/book';
import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import { serializeBookSource } from '@/lib/serializers/book-source';
import InvoiceItemCreateInput from '@/types/InvoiceItemCreateInput';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';

export async function createInvoiceItem(
  invoiceItem: InvoiceItemCreateInput,
): Promise<InvoiceItemHydrated> {
  const {
    book: bookInput,
    invoiceId,
    itemCostInCents,
    quantity,
    totalCostInCents,
  } = invoiceItem;

  const book = await upsertBook(bookInput);

  const rawInvoiceItem = await prisma.invoiceItem.create({
    data: {
      book: {
        connect: { id: book.id },
      },
      invoice: {
        connect: { id: invoiceId },
      },
      itemCostInCents,
      quantity,
      totalCostInCents,
    },
    include: {
      book: {
        include: {
          authors: true,
          publisher: true,
        },
      },
      invoice: true,
    },
  });

  const invoiceItemCreated = {
    ...rawInvoiceItem,
    book: {
      ...rawInvoiceItem.book,
      publisher: serializeBookSource(rawInvoiceItem.book.publisher),
    },
  };

  logger.trace('created invoice item in DB: %j', invoiceItemCreated);

  return invoiceItemCreated;
}
