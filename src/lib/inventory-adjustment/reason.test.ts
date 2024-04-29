import { fakeInventoryAdjustmentReason } from '@/lib/fakes/inventory-adjustment-reason';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { getInventoryAdjustmentReasons } from '@/lib/inventory-adjustment/reason';

describe('inventory-adjustment-reasons actions', () => {
  const reason1 = fakeInventoryAdjustmentReason();
  const reason2 = fakeInventoryAdjustmentReason();

  describe('getInventoryAdjustmentReasons', () => {
    it('should get reasons when provided with default input', async () => {
      prismaMock.inventoryAdjustmentReason.findMany.mockResolvedValue([
        reason1,
        reason2,
      ]);

      const result = await getInventoryAdjustmentReasons();

      expect(result).toEqual([reason1, reason2]);
    });
  });
});
