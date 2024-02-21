import { faker } from '@faker-js/faker';
import { sub } from 'date-fns';

export type CreatedAtUpdatedAt = {
  createdAt: Date;
  updatedAt: Date;
};

export function fakeCreatedAtUpdatedAt(): CreatedAtUpdatedAt {
  const date = faker.date.past();
  let createdAt = new Date(date);
  const updatedAt = new Date(date);

  // randomly set the updated at time to the same time
  if (Math.random() > 0.5) {
    createdAt = sub(createdAt, { months: 6 });
  }

  return {
    createdAt,
    updatedAt,
  };
}
