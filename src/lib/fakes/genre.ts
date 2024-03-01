import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { faker } from '@faker-js/faker';
import { Genre } from '@prisma/client';
import _ from 'lodash';

export function fakeGenre(): Genre {
  return {
    ...fakeCreatedAtUpdatedAt(),
    displayName: _.sample([
      'Fantasy',
      'Literary Fiction',
      'Romance',
      'Science Fiction',
    ]),
    id: faker.number.int(),
  };
}
