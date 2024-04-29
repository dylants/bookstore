import { InventoryAdjustment } from '@prisma/client';

type InventoryAdjustmentCreateInput = Omit<
  InventoryAdjustment,
  'id' | 'createdAt' | 'updatedAt'
>;
export default InventoryAdjustmentCreateInput;
