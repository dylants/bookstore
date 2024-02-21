import { completeInvoice, createInvoice } from '@/lib/actions/invoice';
import { createInvoiceItem } from '@/lib/actions/invoice-item';
import { randomAuthor } from '@/lib/fakes/author';
import { randomBook } from '@/lib/fakes/book';
import { randomPublisher, randomVendor } from '@/lib/fakes/book-source';
import { fakeInvoice } from '@/lib/fakes/invoice';
import { fakeInvoiceItem } from '@/lib/fakes/invoice-item';
import BookCreateInput from '@/types/BookCreateInput';
import { Author, BookSource, Invoice, PrismaClient } from '@prisma/client';
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

type BuildBookCreateInputProps = {
  authors: Author[];
  publishers: BookSource[];
};

function buildBookCreateInput(
  props: BuildBookCreateInputProps,
): BookCreateInput {
  const { authors, publishers } = props;

  const authorsString = _.sampleSize(
    authors,
    // choose 1 author more often
    Math.random() > 0.25
      ? 1
      : // max the authors chosen at 3
        _.random(1, authors.length > 3 ? 3 : authors.length),
  )
    .map((a) => a.name)
    .join(', ');

  const publisherString = (_.sample(publishers) as BookSource).name;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, publisherId, createdAt, updatedAt, quantity, ...data } =
    randomBook();

  return {
    ...data,
    authors: authorsString,
    publisher: publisherString,
    quantity: 0,
  };
}

type GenerateInvoiceItemProps = {
  authors: Author[];
  invoiceId: Invoice['id'];
  publishers: BookSource[];
};

async function generateInvoiceItem(props: GenerateInvoiceItemProps) {
  const { authors, invoiceId, publishers } = props;

  const book = buildBookCreateInput({ authors, publishers });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, bookId, createdAt, updatedAt, ...data } = fakeInvoiceItem();

  return await createInvoiceItem({
    ...data,
    book,
    invoiceId,
  });
}

type GenerateInvoiceProps = {
  authors: Author[];
  numBooks: number;
  publishers: BookSource[];
  vendor: BookSource;
};

async function generateInvoice(props: GenerateInvoiceProps) {
  const { authors, numBooks, publishers, vendor } = props;

  const { invoiceDate, invoiceNumber } = fakeInvoice();
  const { id: invoiceId } = await createInvoice({
    invoiceDate,
    invoiceNumber,
    vendorId: vendor.id,
  });

  const invoiceItemPromises = _.times(numBooks, () =>
    generateInvoiceItem({ authors, invoiceId, publishers }),
  );
  await Promise.all(invoiceItemPromises);

  const invoice = completeInvoice(invoiceId);

  return invoice;
}

async function main() {
  const vendors = await generateVendors(NUM_VENDORS);
  const authors = await generateAuthors(NUM_AUTHORS);
  const publishers = await generatePublishers(NUM_PUBLISHERS);

  // for now a single invoice for all books
  await generateInvoice({
    authors,
    numBooks: NUM_BOOKS,
    publishers,
    vendor: _.sample(vendors) as BookSource,
  });
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
