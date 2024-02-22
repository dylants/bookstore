'use server';

import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import { serializeBookSource } from '@/lib/serializers/book-source';
import BookSourceSerialized from '@/types/BookSourceSerialized';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';

export type GetBookSourcesParams = {
  isPublisher?: boolean;
  isVendor?: boolean;
  paginationQuery?: PaginationQuery;
};

export type GetBookSourcesResult = {
  bookSources: Array<BookSourceSerialized>;
  pageInfo: PageInfo;
};

export async function getBookSources({
  isPublisher,
  isVendor,
  paginationQuery,
}: GetBookSourcesParams): Promise<GetBookSourcesResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const rawItems = await prisma.bookSource.findMany({
    ...paginationRequest,
    where: { isPublisher, isVendor },
  });

  const items = rawItems.map(serializeBookSource);

  const { items: bookSources, pageInfo } =
    buildPaginationResponse<BookSourceSerialized>({
      items,
      paginationQuery,
    });

  return {
    bookSources,
    pageInfo,
  };
}
