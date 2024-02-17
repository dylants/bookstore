import { randomCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { faker } from '@faker-js/faker';
import { Author } from '@prisma/client';

export function randomAuthor(): Author {
  return {
    ...randomCreatedAtUpdatedAt(),
    id: faker.number.int(),
    imageUrl: null,
    name: faker.person.fullName(),
  };
}
