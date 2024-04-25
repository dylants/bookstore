'use server';

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

export async function getGenres(): Promise<Array<Genre>> {
  const genres = await prisma.genre.findMany();

  return genres;
}

export async function findGenre(displayName: string): Promise<Genre | null> {
  return prisma.genre.findUnique({ where: { displayName } });
}

export async function findGenreOrThrow(displayName: string): Promise<Genre> {
  return prisma.genre.findUniqueOrThrow({ where: { displayName } });
}
