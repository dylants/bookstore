'use server';

import prisma from '@/lib/prisma';
import { InventoryAdjustmentReason } from '@prisma/client';

export async function getInventoryAdjustmentReasons(): Promise<
  Array<InventoryAdjustmentReason>
> {
  return await prisma.inventoryAdjustmentReason.findMany();
}
