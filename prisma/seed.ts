import { randomAuthor } from '@/lib/fakes/author';
import { randomBook } from '@/lib/fakes/book';
import { randomBookSource } from '@/lib/fakes/book-source';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = randomBookSource();
  return await prisma.bookSource.create({
    data,
  });
}

async function generateSources(num: number) {
  const sourcePromises = _.times(num, generateSource);
  return await Promise.all(sourcePromises);
}

async function generateAuthor() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = randomAuthor();
  return await prisma.author.create({
    data,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, publisherId, vendorId, ...data } = randomBook();

  return await prisma.book.create({
    data: {
      ...data,
      authors: {
        connect: authorsConnect,
      },
      publisher: {
        connect: props.publisher,
      },
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
