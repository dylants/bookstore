import { faker } from '@faker-js/faker';
import {
  Author,
  BookSource,
  Format,
  Genre,
  PrismaClient,
} from '@prisma/client';
import _ from 'lodash';
const prisma = new PrismaClient();

// ***********************************************************
// ********************* BEGIN VARIABLES *********************
// ***********************************************************

const NUM_SOURCES = 10;
const NUM_AUTHORS = 20;
const NUM_BOOKS = 50;

// ***********************************************************
// ********************** END VARIABLES **********************
// ***********************************************************

async function generateSource() {
  return await prisma.bookSource.create({
    data: {
      name: faker.company.name(),
    },
  });
}

async function generateSources(num: number) {
  const sourcePromises = _.times(num, generateSource);
  return await Promise.all(sourcePromises);
}

async function generateAuthor() {
  return await prisma.author.create({
    data: {
      name: faker.person.fullName(),
    },
  });
}

async function generateAuthors(num: number) {
  const authorPromises = _.times(num, generateAuthor);
  return await Promise.all(authorPromises);
}

const formatKeys = Object.keys(Format) as Format[];
const randomFormat = (): Format => _.sample(formatKeys) as Format;

const genreKeys = Object.keys(Genre) as Genre[];
const randomGenre = (): Genre => _.sample(genreKeys) as Genre;

const randomImage = (): string =>
  `https://picsum.photos/id/${_.random(1, 500)}/128/192`;

const randomIsbn13 = (): bigint =>
  BigInt(
    // remove the decimal
    Math.floor(
      // generate a random number that starts with 1
      (Math.random() + 1) *
        // move the decimal 13 spaces (minus 1 because of the +1 above)
        10 ** (13 - 1),
    ),
  );

interface GenerateBookProps {
  authors: Author[];
  publisher: BookSource;
  vendor: BookSource;
}

async function generateBook(props: GenerateBookProps) {
  const authorsConnect = props.authors.map((a) => ({
    id: a.id,
  }));

  return await prisma.book.create({
    data: {
      authors: {
        connect: authorsConnect,
      },
      format: randomFormat(),
      genre: randomGenre(),
      imageUrl: randomImage(),
      isbn13: randomIsbn13(),
      publishedDate: faker.date.past(),
      publisher: {
        connect: props.publisher,
      },
      title: faker.music.songName(),
      vendor: {
        connect: props.vendor,
      },
    },
  });
}

async function main() {
  const sources = await generateSources(NUM_SOURCES);
  const authors = await generateAuthors(NUM_AUTHORS);

  const bookPromises = _.times(NUM_BOOKS, () =>
    generateBook({
      authors: _.sampleSize(
        authors,
        // choose 1 author more often
        Math.random() > 0.25
          ? 1
          : _.random(1, authors.length > 3 ? 3 : authors.length),
      ),
      publisher: _.sample(sources) as BookSource,
      vendor: _.sample(sources) as BookSource,
    }),
  );
  await Promise.all(bookPromises);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
