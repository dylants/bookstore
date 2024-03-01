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
          format: true,
          genre: true,
          publisher: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    where: { invoiceId },
  });

  const items = rawItems.map((item) => {
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
