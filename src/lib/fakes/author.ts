import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { faker } from '@faker-js/faker';
import { Author } from '@prisma/client';

export function fakeAuthor(): Author {
  return {
    ...fakeCreatedAtUpdatedAt(),
    id: faker.number.int(),
    imageUrl: null,
    name: faker.person.fullName(),
  };
}
