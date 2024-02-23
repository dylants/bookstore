import { completeInvoice, createInvoice } from '@/lib/actions/invoice';
import { createInvoiceItem } from '@/lib/actions/invoice-item';
import { fakeAuthor } from '@/lib/fakes/author';
import { fakeBook } from '@/lib/fakes/book';
import { fakePublisher, fakeVendor } from '@/lib/fakes/book-source';
import { fakeInvoice } from '@/lib/fakes/invoice';
import { fakeInvoiceItem } from '@/lib/fakes/invoice-item';
import BookCreateInput from '@/types/BookCreateInput';
import { BookSource, Invoice, PrismaClient } from '@prisma/client';
import retry from 'async-retry';
import _ from 'lodash';
const prisma = new PrismaClient();

// ***********************************************************
// ********************* BEGIN VARIABLES *********************
// ***********************************************************

const NUM_VENDORS = checkForEnvVariable(process.env.SEED_NUM_VENDORS, 5);
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
  const { id, ...data } = fakeVendor();
  // TODO replace with create vendor once it exists
  return await prisma.bookSource.create({
    data,
  });
}

async function generateVendors(num: number) {
  const vendorPromises = _.times(num, generateVendor);
  return await Promise.all(vendorPromises);
}

function fakeAuthorName() {
  const { name } = fakeAuthor();
  return name;
}

function fakePublisherName() {
  const { name } = fakePublisher();
  return name;
}

type BuildBookCreateInputProps = {
  authorNames: string[];
  publisherNames: string[];
};

function buildBookCreateInput(
  props: BuildBookCreateInputProps,
): BookCreateInput {
  const { authorNames, publisherNames } = props;

  const authorsString = _.sampleSize(
    authorNames,
    // choose 1 author more often
    Math.random() > 0.25
      ? 1
      : // max the names chosen at 3
        _.random(1, authorNames.length > 3 ? 3 : authorNames.length),
  ).join(', ');

  const publisherString = _.sample(publisherNames) as string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, publisherId, ...data } = fakeBook();

  return {
    ...data,
    authors: authorsString,
    publisher: publisherString,
    quantity: 0,
  };
}

type GenerateInvoiceItemProps = {
  authorNames: string[];
  invoiceId: Invoice['id'];
  publisherNames: string[];
};

async function generateInvoiceItem(props: GenerateInvoiceItemProps) {
  const { authorNames, invoiceId, publisherNames } = props;

  const book = buildBookCreateInput({ authorNames, publisherNames });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, bookId, createdAt, updatedAt, ...data } = fakeInvoiceItem();

  return await createInvoiceItem({
    ...data,
    book,
    invoiceId,
  });
}

type GenerateInvoiceProps = {
  authorNames: string[];
  markComplete?: boolean;
  numBooks: number;
  publisherNames: string[];
  vendor: BookSource;
};

async function generateInvoice(props: GenerateInvoiceProps) {
  const { authorNames, markComplete, numBooks, publisherNames, vendor } = props;

  const { invoiceDate, invoiceNumber } = fakeInvoice();
  const { id: invoiceId } = await createInvoice({
    invoiceDate,
    invoiceNumber,
    vendorId: vendor.id,
  });

  const invoiceItemPromises = _.times(numBooks, () =>
    // retry on failure since during seed phase we're creating invoice items / books in quick
    // succession which can lead to errors with the underlying transaction.
    retry(
      async () =>
        generateInvoiceItem({ authorNames, invoiceId, publisherNames }),
      { retries: 5 },
    ),
  );
  await Promise.all(invoiceItemPromises);

  if (markComplete) {
    await completeInvoice(invoiceId);
  }
}

async function main() {
  const vendors = await generateVendors(NUM_VENDORS);

  // this represents the "scope" of available authors and publishers
  const authorNames = _.times(NUM_BOOKS, fakeAuthorName);
  const publisherNames = _.times(NUM_BOOKS, fakePublisherName);

  const invoiceOneBooks = NUM_BOOKS - _.random(1, NUM_BOOKS - 1);
  const invoiceTwoBooks = NUM_BOOKS - invoiceOneBooks;

  await generateInvoice({
    authorNames,
    markComplete: true,
    numBooks: invoiceOneBooks,
    publisherNames,
    vendor: _.sample(vendors) as BookSource,
  });
  await generateInvoice({
    authorNames,
    markComplete: true,
    numBooks: invoiceTwoBooks,
    publisherNames,
    vendor: _.sample(vendors) as BookSource,
  });
  await generateInvoice({
    authorNames,
    markComplete: false,
    numBooks: 0,
    publisherNames,
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
