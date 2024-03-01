import { fakeAuthor } from '@/lib/fakes/author';
import { fakePublisher } from '@/lib/fakes/book-source';
import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { fakeFormat } from '@/lib/fakes/format';
import { fakeGenre } from '@/lib/fakes/genre';
import { convertDollarsToCents } from '@/lib/money';
import { serializeBookSource } from '@/lib/serializers/book-source';
import BookHydrated from '@/types/BookHydrated';
import { faker } from '@faker-js/faker';
import { Book } from '@prisma/client';
import _ from 'lodash';

const randomImage = (): string =>
  `https://picsum.photos/id/${_.random(1, 500)}/128/192`;

const fakeIsbn13 = (): bigint =>
  BigInt(faker.commerce.isbn({ separator: '', variant: 13 }));

export function fakeBook(): Book {
  const priceInCents =
    convertDollarsToCents(faker.commerce.price({ max: 50, min: 2 })) + 99;

  return {
    ...fakeCreatedAtUpdatedAt(),
    formatId: faker.number.int(),
    genreId: faker.number.int(),
    id: faker.number.int(),
    imageUrl: randomImage(),
    isbn13: fakeIsbn13(),
    priceInCents,
    publishedDate: faker.date.past(),
    publisherId: faker.number.int(),
    quantity: 0,
    title: faker.music.songName(),
  };
}

export function fakeBookHydrated(): BookHydrated {
  const authors = [fakeAuthor()];
  const format = fakeFormat();
  const genre = fakeGenre();
  const publisher = fakePublisher();

  return {
    ...fakeBook(),
    authors,
    format,
    genre,
    publisher: serializeBookSource(publisher),
  };
}
