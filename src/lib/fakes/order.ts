import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { computeTax, convertDollarsToCents } from '@/lib/money';
import { faker } from '@faker-js/faker';
import { Order, OrderState } from '@prisma/client';

export function fakeOrder(orderState: OrderState = OrderState.OPEN): Order {
  const subTotalInCents = convertDollarsToCents(
    faker.commerce.price({ max: 50, min: 2 }),
  );
  const taxInCents = computeTax(subTotalInCents);
  const totalInCents = subTotalInCents + taxInCents;

  return {
    ...fakeCreatedAtUpdatedAt(),
    id: faker.number.int(),
    orderClosedDate: null,
    orderOpenedDate: faker.date.past(),
    orderState,
    orderUID: faker.number.int().toString(),
    subTotalInCents,
    taxInCents,
    totalInCents,
  };
}
