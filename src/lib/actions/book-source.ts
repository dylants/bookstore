'use server';

import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import { BookSource } from '@prisma/client';

export type GetBookSourcesParams = {
  paginationQuery?: PaginationQuery;
};

export type GetBookSourcesResult = {
  bookSources: Array<BookSource>;
  pageInfo: PageInfo;
};

export async function getBookSources({
  paginationQuery,
}: GetBookSourcesParams): Promise<GetBookSourcesResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const items = await prisma.bookSource.findMany({
    ...paginationRequest,
  });

  const { items: bookSources, pageInfo } = buildPaginationResponse<BookSource>({
    items,
    paginationQuery,
  });

  return {
    bookSources,
    pageInfo,
  };
}
