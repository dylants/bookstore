'use server';

import logger from '@/lib/logger';
import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { serializeBookSource } from '@/lib/serializers/book-source';
import InvoiceCreateInput from '@/types/InvoiceCreateInput';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import { Invoice, Prisma } from '@prisma/client';

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

async function updateBookQuantity(
  tx: Prisma.TransactionClient,
  bookId: number,
  increasedQuantity: number,
): Promise<void> {
  const book = await tx.book.findUniqueOrThrow({
    where: { id: bookId },
  });

  const updatedQuantity = book.quantity + increasedQuantity;

  await tx.book.update({
    data: { quantity: updatedQuantity },
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

  // condense all the book updates by book ID
  const bookUpdates = invoiceItems.reduce(
    (acc, item) => {
      const match = acc.find((i) => i.id === item.bookId);
      if (match) {
        match.increasedQuantity += item.quantity;
      } else {
        acc.push({
          id: item.bookId,
          increasedQuantity: item.quantity,
        });
      }
      return acc;
    },
    [] as Array<{ id: number; increasedQuantity: number }>,
  );

  return prisma.$transaction(
    async (tx) => {
      logger.trace(
        'updating books for %d invoice items...',
        invoiceItems.length,
      );
      await Promise.all(
        bookUpdates.map((update) =>
          updateBookQuantity(tx, update.id, update.increasedQuantity),
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

export async function getInvoice(
  id: Invoice['id'],
): Promise<InvoiceHydrated | null> {
  const invoice = await prisma.invoice.findUnique({
    include: {
      _count: {
        select: { invoiceItems: true },
      },
      vendor: true,
    },
    where: { id },
  });

  if (invoice) {
    return {
      ...invoice,
      numInvoiceItems: invoice._count.invoiceItems,
      vendor: serializeBookSource(invoice.vendor),
    };
  } else {
    return null;
  }
}
