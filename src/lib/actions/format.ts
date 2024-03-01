'use server';

import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import { Format } from '@prisma/client';

export interface GetFormatsParams {
  paginationQuery?: PaginationQuery;
}

export interface GetFormatsResult {
  formats: Array<Format>;
  pageInfo: PageInfo;
}

export async function getFormats({
  paginationQuery,
}: GetFormatsParams): Promise<GetFormatsResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const items = await prisma.format.findMany({
    ...paginationRequest,
  });

  const { items: formats, pageInfo } = buildPaginationResponse<Format>({
    items,
    paginationQuery,
  });

  return {
    formats,
    pageInfo,
  };
}

export async function findFormat(displayName: string): Promise<Format | null> {
  return prisma.format.findUnique({ where: { displayName } });
}

export async function findFormatOrThrow(displayName: string): Promise<Format> {
  return prisma.format.findUniqueOrThrow({ where: { displayName } });
}
