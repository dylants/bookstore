import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { faker } from '@faker-js/faker';
import { Format } from '@prisma/client';
import _ from 'lodash';

export function fakeFormat(): Format {
  return {
    ...fakeCreatedAtUpdatedAt(),
    displayName: _.sample([
      'Hardcover',
      'Mass Market Paperback',
      'Trade Paperback',
    ]),
    id: faker.number.int(),
  };
}
