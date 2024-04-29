'use server';

import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import { serializeBookSource } from '@/lib/serializers/book-source';
import BookHydrated from '@/types/BookHydrated';
import InventoryAdjustmentCreateInput from '@/types/InventoryAdjustmentCreateInput';
import { ProductType } from '@prisma/client';
import _ from 'lodash';

export async function createInventoryAdjustment(
  adjustment: InventoryAdjustmentCreateInput,
): Promise<BookHydrated> {
  logger.trace('bookInventoryAdjustment, adjustment: %j', adjustment);

  const { bookId, productType, reasonId, updatedQuantity } = adjustment;

  // we only handle invoice items of product type Book at this time
  if (productType !== ProductType.BOOK || !bookId) {
    logger.error('createInventoryAdjustment asked to create without bookId');
    throw new Error('bookId required as input to create inventory adjustment');
  }

  if (!_.isNumber(updatedQuantity) || updatedQuantity < 0) {
    logger.error('createInventoryAdjustment asked to set invalid quantity');
    throw new Error('invalid quantity to create inventory adjustment');
  }

  return prisma.$transaction(async (tx) => {
    // adjust the inventory first
    const book = await tx.book.update({
      data: { quantity: updatedQuantity },
      include: {
        authors: true,
        format: true,
        genre: true,
        publisher: true,
      },
      where: { id: bookId },
    });

    const reason = await tx.inventoryAdjustmentReason.findUniqueOrThrow({
      where: { id: reasonId },
    });

    // create the inventory adjustment to mark the occasion
    await tx.inventoryAdjustment.create({
      data: {
        book: { connect: { id: book.id } },
        productType: ProductType.BOOK,
        reason: { connect: { id: reason.id } },
        updatedQuantity,
      },
    });

    return {
      ...book,
      publisher: serializeBookSource(book.publisher),
    };
  });
}
