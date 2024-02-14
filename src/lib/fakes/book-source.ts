import { faker } from '@faker-js/faker';
import { BookSource } from '@prisma/client';

export function randomBookSource(): BookSource {
  return { id: faker.number.int(), name: faker.company.name() };
}
