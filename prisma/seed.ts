import { randomAuthor } from '@/lib/fakes/author';
import { randomBook } from '@/lib/fakes/book';
import { randomPublisher, randomVendor } from '@/lib/fakes/book-source';
import { Author, BookSource, PrismaClient } from '@prisma/client';
import _ from 'lodash';
const prisma = new PrismaClient();

// ***********************************************************
// ********************* BEGIN VARIABLES *********************
// ***********************************************************

const NUM_VENDORS = checkForEnvVariable(process.env.SEED_NUM_VENDORS, 5);
const NUM_PUBLISHERS = checkForEnvVariable(process.env.SEED_NUM_PUBLISHERS, 10);
const NUM_AUTHORS = checkForEnvVariable(process.env.SEED_NUM_AUTHORS, 20);
const NUM_BOOKS = checkForEnvVariable(process.env.SEED_NUM_BOOKS, 50);

// ***********************************************************
// ********************** END VARIABLES **********************
// ***********************************************************

function checkForEnvVariable(
  envValue: string | undefined,
  defaultValue: number,
): number {
  if (envValue) {
    return _.toNumber(envValue);
  } else {
    return defaultValue;
  }
}

async function generatePublisher() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = randomPublisher();
  return await prisma.bookSource.create({
    data,
  });
}

async function generatePublishers(num: number) {
  const publisherPromises = _.times(num, generatePublisher);
  return await Promise.all(publisherPromises);
}

async function generateVendor() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = randomVendor();
  return await prisma.bookSource.create({
    data,
  });
}

async function generateVendors(num: number) {
  const vendorPromises = _.times(num, generateVendor);
  return await Promise.all(vendorPromises);
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
  const { id, publisherId, ...data } = randomBook();

  return await prisma.book.create({
    data: {
      ...data,
      authors: {
        connect: authorsConnect,
      },
      publisher: {
        connect: props.publisher,
      },
    },
  });
}

async function main() {
  const vendors = await generateVendors(NUM_VENDORS);
  const authors = await generateAuthors(NUM_AUTHORS);
  const publishers = await generatePublishers(NUM_PUBLISHERS);

  const bookPromises = _.times(NUM_BOOKS, () =>
    generateBook({
      authors: _.sampleSize(
        authors,
        // choose 1 author more often
        Math.random() > 0.25
          ? 1
          : _.random(1, authors.length > 3 ? 3 : authors.length),
      ),
      publisher: _.sample(publishers) as BookSource,
      vendor: _.sample(vendors) as BookSource,
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
