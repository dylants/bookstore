import { InventoryAdjustment, ProductType } from '@prisma/client';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeInventoryAdjustmentReason } from '@/lib/fakes/inventory-adjustment-reason';
import { fakeBookHydrated } from '@/lib/fakes/book';
import { createInventoryAdjustment } from '@/lib/inventory-adjustment/adjustment';

jest.mock('../serializers/book-source', () => ({
  serializeBookSource: () => undefined,
}));

describe('inventory-adjustment', () => {
  const book1 = fakeBookHydrated();
  const reason1 = fakeInventoryAdjustmentReason();

  describe('createInventoryAdjustment', () => {
    beforeEach(() => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));
    });

    it('should adjust inventory with valid input', async () => {
      prismaMock.book.update.mockResolvedValue(book1);
      prismaMock.inventoryAdjustmentReason.findUniqueOrThrow.mockResolvedValue(
        reason1,
      );
      prismaMock.inventoryAdjustment.create.mockResolvedValue(
        {} as InventoryAdjustment,
      );

      const result = await createInventoryAdjustment({
        bookId: book1.id,
        productType: ProductType.BOOK,
        reasonId: reason1.id,
        updatedQuantity: 23,
      });

      expect(prismaMock.book.update).toHaveBeenCalledWith({
        data: { quantity: 23 },
        include: {
          authors: true,
          format: true,
          genre: true,
          publisher: true,
        },
        where: { id: book1.id },
      });

      expect(
        prismaMock.inventoryAdjustmentReason.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: reason1.id },
      });

      expect(prismaMock.inventoryAdjustment.create).toHaveBeenCalledWith({
        data: {
          book: { connect: { id: book1.id } },
          productType: ProductType.BOOK,
          reason: { connect: { id: reason1.id } },
          updatedQuantity: 23,
        },
      });

      expect(result).toEqual(book1);
    });

    it('should throw error with invalid ProductType', async () => {
      await expect(
        createInventoryAdjustment({
          bookId: book1.id,
          productType: 'foo' as unknown as ProductType,
          reasonId: reason1.id,
          updatedQuantity: 23,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"bookId required as input to create inventory adjustment"`,
      );
    });

    it('should throw error with no bookId', async () => {
      await expect(
        createInventoryAdjustment({
          bookId: null,
          productType: ProductType.BOOK,
          reasonId: reason1.id,
          updatedQuantity: 23,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"bookId required as input to create inventory adjustment"`,
      );
    });

    it('should throw error with invalid quantity (string)', async () => {
      await expect(
        createInventoryAdjustment({
          bookId: book1.id,
          productType: ProductType.BOOK,
          reasonId: reason1.id,
          updatedQuantity: 'hi' as unknown as number,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"invalid quantity to create inventory adjustment"`,
      );
    });

    it('should throw error with invalid quantity (negative)', async () => {
      await expect(
        createInventoryAdjustment({
          bookId: book1.id,
          productType: ProductType.BOOK,
          reasonId: reason1.id,
          updatedQuantity: -1,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"invalid quantity to create inventory adjustment"`,
      );
    });
  });
});
