import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { serializeBookSource } from '@/lib/serializers/book-source';
import BookSourceSerialized from '@/types/BookSourceSerialized';
import { faker } from '@faker-js/faker';
import { BookSource, Prisma } from '@prisma/client';

export function fakePublisher(): BookSource {
  return {
    ...fakeCreatedAtUpdatedAt(),
    accountNumber: null,
    discountPercentage: null,
    id: faker.number.int(),
    isPublisher: true,
    isVendor: false,
    name: faker.company.name(),
  };
}

export function fakeVendor(): BookSource {
  // some vendors can also be publishers, so randomly assign isPublisher
  const isPublisher = faker.datatype.boolean();

  return {
    ...fakeCreatedAtUpdatedAt(),
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

export function fakeVendorSerialized(): BookSourceSerialized {
  return serializeBookSource(fakeVendor());
}
