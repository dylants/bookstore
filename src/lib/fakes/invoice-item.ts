import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { faker } from '@faker-js/faker';
import { InvoiceItem } from '@prisma/client';
import _ from 'lodash';

export function fakeInvoiceItem(): InvoiceItem {
  const itemCostInCents = _.toNumber(faker.commerce.price({ max: 100 })) * 100;
  const quantity =
    Math.random() > 0.3 ? 1 : faker.number.int({ max: 10, min: 1 });
  const totalCostInCents = itemCostInCents * quantity;

  return {
    ...fakeCreatedAtUpdatedAt(),
    bookId: faker.number.int(),
    id: faker.number.int(),
    invoiceId: faker.number.int(),
    itemCostInCents,
    quantity,
    totalCostInCents,
  };
}