'use server';

import { reduceBookUpdates, updateBookQuantity } from '@/lib/actions/book';
import logger from '@/lib/logger';
import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { serializeBookSource } from '@/lib/serializers/book-source';
import InvoiceCreateInput from '@/types/InvoiceCreateInput';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import InvoiceHydratedWithItemsHydrated from '@/types/InvoiceHydratedWithItemsHydrated';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import { Invoice, Prisma, ProductType } from '@prisma/client';

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
      vendor: true,
    },
  });

  logger.trace('created invoice in DB: %j', createdInvoice);

  return {
    ...createdInvoice,
    // when we create a new invoice, we have no invoice items, so this can be hardcoded
    numInvoiceItems: 0,
    vendor: serializeBookSource(createdInvoice.vendor),
  };
}

export async function completeInvoice(
  invoiceId: Invoice['id'],
): Promise<InvoiceHydrated> {
  const invoiceItems = await prisma.invoiceItem.findMany({
    where: { invoiceId },
  });

  // condense all the book updates by book ID
  const bookUpdates = await reduceBookUpdates(invoiceItems);

  return prisma.$transaction(
    async (tx) => {
      logger.trace(
        'updating books for %d invoice items...',
        invoiceItems.length,
      );
      await Promise.all(
        bookUpdates.map((update) =>
          updateBookQuantity({
            bookId: update.id,
            quantityChange: update.increasedQuantity,
            tx,
          }),
        ),
      );

      logger.trace('marking invoice complete, invoice id: %s', invoiceId);
      const invoice = await tx.invoice.update({
        data: {
          dateReceived: new Date(),
          isCompleted: true,
        },
        include: {
          _count: {
            select: { invoiceItems: true },
          },
          vendor: true,
        },
        where: { id: invoiceId },
      });

      return {
        ...invoice,
        numInvoiceItems: invoice._count.invoiceItems,
        vendor: serializeBookSource(invoice.vendor),
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export interface GetInvoicesParams {
  paginationQuery?: PaginationQuery;
}

export interface GetInvoicesResult {
  invoices: Array<InvoiceHydrated>;
  pageInfo: PageInfo;
}

export async function getInvoices({
  paginationQuery,
}: GetInvoicesParams): Promise<GetInvoicesResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const rawItems = await prisma.invoice.findMany({
    ...paginationRequest,
    include: {
      _count: {
        select: { invoiceItems: true },
      },
      vendor: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const items = rawItems.map((item) => ({
    ...item,
    numInvoiceItems: item._count.invoiceItems,
    vendor: serializeBookSource(item.vendor),
  }));

  const { items: invoices, pageInfo } =
    buildPaginationResponse<InvoiceHydrated>({
      items,
      paginationQuery,
    });

  return {
    invoices,
    pageInfo,
  };
}

export async function getInvoiceWithItems(
  id: Invoice['id'],
): Promise<InvoiceHydratedWithItemsHydrated | null> {
  const invoice = await prisma.invoice.findUnique({
    include: {
      _count: {
        select: { invoiceItems: true },
      },
      // We're not paginating the invoice items, which assumes the list is
      // not long. But at this point we can assume that safely.
      invoiceItems: {
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
        orderBy: { createdAt: 'desc' },
      },
      vendor: true,
    },
    where: { id },
  });

  if (!invoice) {
    return null;
  }

  const items = invoice.invoiceItems.map((item) => {
    if (item.productType !== ProductType.BOOK) {
      // we have no other product types at this time, so this should not happen
      logger.warn('non-book product type encountered: %j', item);
      return {
        ...item,
        book: undefined,
        bookId: null,
      };
    }

    // we can assume the book is available based on code above
    const itemBook = item.book!;

    return {
      ...item,
      book: {
        ...itemBook,
        publisher: serializeBookSource(itemBook.publisher),
      },
    };
  });

  return {
    ...invoice,
    invoiceItems: items,
    numInvoiceItems: invoice._count.invoiceItems,
    vendor: serializeBookSource(invoice.vendor),
  };
}
