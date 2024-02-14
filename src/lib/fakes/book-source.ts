import { faker } from '@faker-js/faker';
import { BookSource } from '@prisma/client';

export function randomBookSource(): BookSource {
  let isPublisher = faker.datatype.boolean();
  let isVendor = faker.datatype.boolean();

  // at least one of these must be true
  if (!isPublisher && !isVendor) {
    if (Math.random() > 0.5) {
      isPublisher = true;
    } else {
      isVendor = true;
    }
  }

  return {
    id: faker.number.int(),
    isPublisher,
    isVendor,
    name: faker.company.name(),
  };
}
