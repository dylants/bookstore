import { fakeBookHydrated } from '@/lib/fakes/book';
import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { convertDollarsToCents } from '@/lib/money';
import OrderItemHydrated from '@/types/OrderItemHydrated';
import { faker } from '@faker-js/faker';
import { OrderItem, ProductType } from '@prisma/client';

export function fakeOrderItem(): OrderItem {
  const productPriceInCents = convertDollarsToCents(
    faker.commerce.price({ max: 50, min: 2 }),
  );
  const quantity =
    Math.random() > 0.3 ? 1 : faker.number.int({ max: 10, min: 1 });
  const totalPriceInCents = productPriceInCents * quantity;

  return {
    ...fakeCreatedAtUpdatedAt(),
    bookId: faker.number.int(),
    id: faker.number.int(),
    orderId: faker.number.int(),
    productPriceInCents,
    productType: ProductType.BOOK,
    quantity,
    totalPriceInCents,
  };
}

export function fakeOrderItemHydrated(): OrderItemHydrated {
  const orderItem = fakeOrderItem();
  const book = fakeBookHydrated();

  return {
    ...orderItem,
    book,
  };
}
