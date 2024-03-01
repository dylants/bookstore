'use server';

import {
  buildPaginationRequest,
  buildPaginationResponse,
} from '@/lib/pagination';
import prisma from '@/lib/prisma';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import { Genre } from '@prisma/client';

export interface GetGenresParams {
  paginationQuery?: PaginationQuery;
}

export interface GetGenresResult {
  genres: Array<Genre>;
  pageInfo: PageInfo;
}

export async function getGenres({
  paginationQuery,
}: GetGenresParams): Promise<GetGenresResult> {
  const paginationRequest = buildPaginationRequest({ paginationQuery });

  const items = await prisma.genre.findMany({
    ...paginationRequest,
  });

  const { items: genres, pageInfo } = buildPaginationResponse<Genre>({
    items,
    paginationQuery,
  });

  return {
    genres,
    pageInfo,
  };
}

export async function findGenre(displayName: string): Promise<Genre | null> {
  return prisma.genre.findUnique({ where: { displayName } });
}

export async function findGenreOrThrow(displayName: string): Promise<Genre> {
  return prisma.genre.findUniqueOrThrow({ where: { displayName } });
}
