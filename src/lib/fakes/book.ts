import { fakeAuthor } from '@/lib/fakes/author';
import { fakePublisher } from '@/lib/fakes/book-source';
import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { serializeBookSource } from '@/lib/serializers/book-source';
import BookHydrated from '@/types/BookHydrated';
import { faker } from '@faker-js/faker';
import { Book, Format, Genre } from '@prisma/client';
import _ from 'lodash';

const formatKeys = Object.keys(Format) as Format[];
const randomFormat = (): Format => _.sample(formatKeys) as Format;

const genreKeys = Object.keys(Genre) as Genre[];
const randomGenre = (): Genre => _.sample(genreKeys) as Genre;

const randomImage = (): string =>
  `https://picsum.photos/id/${_.random(1, 500)}/128/192`;

const fakeIsbn13 = (): bigint =>
  BigInt(faker.commerce.isbn({ separator: '', variant: 13 }));

export function fakeBook(): Book {
  const priceInCents = _.toNumber(faker.commerce.price({ max: 50 })) * 100 + 99;

  return {
    ...fakeCreatedAtUpdatedAt(),
    format: randomFormat(),
    genre: randomGenre(),
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
  const publisher = fakePublisher();

  return {
    ...fakeBook(),
    authors,
    publisher: serializeBookSource(publisher),
  };
}
