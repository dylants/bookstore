import { faker } from '@faker-js/faker';
import { Book, Format, Genre } from '@prisma/client';
import _ from 'lodash';

const formatKeys = Object.keys(Format) as Format[];
export const randomFormat = (): Format => _.sample(formatKeys) as Format;

const genreKeys = Object.keys(Genre) as Genre[];
export const randomGenre = (): Genre => _.sample(genreKeys) as Genre;

export const randomImage = (): string =>
  `https://picsum.photos/id/${_.random(1, 500)}/128/192`;

export const randomIsbn13 = (): bigint =>
  BigInt(
    // remove the decimal
    Math.floor(
      // generate a random number that starts with 1
      (Math.random() + 1) *
        // move the decimal 13 spaces (minus 1 because of the +1 above)
        10 ** (13 - 1),
    ),
  );

export function randomBook(): Book {
  return {
    format: randomFormat(),
    genre: randomGenre(),
    id: faker.number.int(),
    imageUrl: randomImage(),
    isbn13: randomIsbn13(),
    publishedDate: faker.date.past(),
    publisherId: faker.number.int(),
    title: faker.music.songName(),
    vendorId: faker.number.int(),
  };
}

// TODO add typing
export function randomBookType() {
  return {
    author: faker.person.fullName(),
    format: randomFormat(),
    genre: randomGenre(),
    imageUrl: randomImage(),
    isbn: randomIsbn13().toString(),
    publishedDate: faker.date.past(),
    publisher: faker.company.name(),
    title: faker.music.songName(),
  };
}
