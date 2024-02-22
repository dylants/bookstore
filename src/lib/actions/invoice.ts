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
  });
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
