import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { convertDollarsToCents } from '@/lib/money';
import { faker } from '@faker-js/faker';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

export function fakeTransaction(
  status: TransactionStatus = TransactionStatus.PENDING,
): Transaction {
  const amountInCents = convertDollarsToCents(
    faker.commerce.price({ max: 50, min: 2 }),
  );

  return {
    ...fakeCreatedAtUpdatedAt(),
    amountInCents,
    id: faker.number.int(),
    orderUID: faker.number.int().toString(),
    status,
    transactionType: TransactionType.SQUARE_CHECKOUT,
    transactionUID: faker.number.int().toString(),
  };
}
