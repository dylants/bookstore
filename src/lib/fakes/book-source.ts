import { randomCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { faker } from '@faker-js/faker';
import { BookSource, Prisma } from '@prisma/client';

export function randomPublisher(): BookSource {
  return {
    ...randomCreatedAtUpdatedAt(),
    accountNumber: null,
    discountPercentage: null,
    id: faker.number.int(),
    isPublisher: true,
    isVendor: false,
    name: faker.company.name(),
  };
}

export function randomVendor(): BookSource {
  // some vendors can also be publishers, so randomly assign isPublisher
  const isPublisher = faker.datatype.boolean();

  return {
    ...randomCreatedAtUpdatedAt(),
    accountNumber: faker.finance.accountNumber(),
    discountPercentage: new Prisma.Decimal(
      faker.number.float({ fractionDigits: 2 }),
    ),
    id: faker.number.int(),
    isPublisher,
    isVendor: true,
    name: faker.company.name(),
  };
}
