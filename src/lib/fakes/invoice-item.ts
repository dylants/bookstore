import { fakeBookHydrated } from '@/lib/fakes/book';
import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { convertDollarsToCents } from '@/lib/money';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import { faker } from '@faker-js/faker';
import { InvoiceItem, ProductType } from '@prisma/client';
import _ from 'lodash';

export function fakeInvoiceItem({
  quantity: inboundQuantity,
}: {
  quantity?: number;
}): InvoiceItem {
  const itemCostInCents =
    convertDollarsToCents(faker.commerce.price({ max: 20 })) + 99;
  const quantity = _.isNumber(inboundQuantity)
    ? inboundQuantity
    : Math.random() > 0.3
      ? 1
      : faker.number.int({ max: 10, min: 1 });
  const totalCostInCents = itemCostInCents * quantity;

  return {
    ...fakeCreatedAtUpdatedAt(),
    bookId: faker.number.int(),
    id: faker.number.int(),
    invoiceId: faker.number.int(),
    itemCostInCents,
    productType: ProductType.BOOK,
    quantity,
    totalCostInCents,
  };
}

export function fakeInvoiceItemHydrated({
  quantity,
}: {
  quantity?: number;
}): InvoiceItemHydrated {
  const invoiceItem = fakeInvoiceItem({ quantity });
  const book = fakeBookHydrated();

  return {
    ...invoiceItem,
    book,
  };
}
