import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { faker } from '@faker-js/faker';
import { InventoryAdjustmentReason } from '@prisma/client';
import _ from 'lodash';

export function fakeInventoryAdjustmentReason(): InventoryAdjustmentReason {
  return {
    ...fakeCreatedAtUpdatedAt(),
    displayName: _.sample(['Incorrect Inventory', 'Damage', 'Theft']),
    id: faker.number.int(),
  };
}
