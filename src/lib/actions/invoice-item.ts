'use server';

import { upsertBook } from '@/lib/actions/book';
import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import { serializeBookSource } from '@/lib/serializers/book-source';
import InvoiceItemCreateInput from '@/types/InvoiceItemCreateInput';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import { ProductType } from '@prisma/client';

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

  // we only handle invoice items of product type Book at this time
  const productType = ProductType.BOOK;
  if (!bookInput) {
    logger.error('createInvoiceItem asked to create without bookInput');
    throw new Error('Book required as input at this time');
  }

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
      productType,
      quantity,
      totalCostInCents,
    },
    include: {
      book: {
        include: {
          authors: true,
          format: true,
          genre: true,
          publisher: true,
        },
      },
    },
  });

  // we can assume the book is available based on code above
  const rawInvoiceItemBook = rawInvoiceItem.book!;

  const invoiceItemCreated = {
    ...rawInvoiceItem,
    book: {
      ...rawInvoiceItemBook,
      publisher: serializeBookSource(rawInvoiceItemBook.publisher),
    },
  };

  logger.trace('created invoice item in DB: %j', invoiceItemCreated);

  return invoiceItemCreated;
}
