'use server';

import prisma from '@/lib/prisma';
import { Format } from '@prisma/client';

export async function getFormats(): Promise<Array<Format>> {
  const formats = await prisma.format.findMany();

  return formats;
}

export async function findFormat(displayName: string): Promise<Format | null> {
  return prisma.format.findUnique({ where: { displayName } });
}

export async function findFormatOrThrow(displayName: string): Promise<Format> {
  return prisma.format.findUniqueOrThrow({ where: { displayName } });
}
