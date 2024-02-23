'use server';

import { upsertBook } from '@/lib/actions/book';
import logger from '@/lib/logger';
import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { serializeBookSource } from '@/lib/serializers/book-source';
import InvoiceItemCreateInput from '@/types/InvoiceItemCreateInput';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';

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

export interface GetInvoiceItemsParams {
  paginationQuery?: PaginationQuery;
  invoiceId?: number;
}

export interface GetInvoiceItemsResult {
  invoiceItems: Array<InvoiceItemHydrated>;
  pageInfo: PageInfo;
}

export async function getInvoiceItems({
  paginationQuery,
  invoiceId,
}: GetInvoiceItemsParams): Promise<GetInvoiceItemsResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const rawItems = await prisma.invoiceItem.findMany({
    ...paginationRequest,
    include: {
      book: {
        include: {
          authors: true,
          publisher: true,
        },
      },
    },
    where: { invoiceId },
  });

  const items = rawItems.map((item) => ({
    ...item,
    book: {
      ...item.book,
      publisher: serializeBookSource(item.book.publisher),
    },
  }));

  const { items: invoiceItems, pageInfo } =
    buildPaginationResponse<InvoiceItemHydrated>({
      items,
      paginationQuery,
    });

  return {
    invoiceItems,
    pageInfo,
  };
}
