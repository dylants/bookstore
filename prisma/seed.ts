import { randomBookType } from '../src/lib/fakes/book';
import { faker } from '@faker-js/faker';
import { Author, BookSource, PrismaClient } from '@prisma/client';
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

interface GenerateBookProps {
  authors: Author[];
  publisher: BookSource;
  vendor: BookSource;
}

async function generateBook(props: GenerateBookProps) {
  const authorsConnect = props.authors.map((a) => ({
    id: a.id,
  }));

  const { format, genre, imageUrl, isbn, publishedDate, title } =
    randomBookType();

  return await prisma.book.create({
    data: {
      authors: {
        connect: authorsConnect,
      },
      format,
      genre,
      imageUrl,
      isbn13: BigInt(isbn),
      publishedDate,
      publisher: {
        connect: props.publisher,
      },
      title,
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
