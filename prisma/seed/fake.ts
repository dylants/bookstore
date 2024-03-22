import { completeInvoice, createInvoice } from '@/lib/actions/invoice';
import { createInvoiceItem } from '@/lib/actions/invoice-item';
import { fakeAuthor } from '@/lib/fakes/author';
import { fakeBook } from '@/lib/fakes/book';
import { fakePublisher, fakeVendor } from '@/lib/fakes/book-source';
import { fakeInvoice } from '@/lib/fakes/invoice';
import { fakeInvoiceItem } from '@/lib/fakes/invoice-item';
import prisma from '@/lib/prisma';
import BookCreateInput from '@/types/BookCreateInput';
import {
  Book,
  BookSource,
  Format,
  Genre,
  Invoice,
  ProductType,
} from '@prisma/client';
import retry from 'async-retry';
import _ from 'lodash';
import generateCoreSeeds from './core';
import {
  createOrder,
  moveOrderToPendingTransactionOrThrow,
} from '@/lib/actions/order';
import { createOrderItem } from '@/lib/actions/order-item';

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

type BaseScopeProps = {
  authorNames: string[];
  formats: Array<Format>;
  genres: Array<Genre>;
  publisherNames: string[];
};

type BuildBookCreateInputProps = BaseScopeProps;

function buildBookCreateInput(
  props: BuildBookCreateInputProps,
): BookCreateInput {
  const { authorNames, formats, genres, publisherNames } = props;

  const authorsString = _.sampleSize(
    authorNames,
    // choose 1 author more often
    Math.random() > 0.25
      ? 1
      : // max the names chosen at 3
        _.random(1, authorNames.length > 3 ? 3 : authorNames.length),
  ).join(', ');

  const publisherString = _.sample(publisherNames) as string;

  const format = _.sample(formats) as Format;
  const genre = _.sample(genres) as Genre;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, formatId, genreId, publisherId, ...data } =
    fakeBook();

  return {
    ...data,
    authors: authorsString,
    formatId: format.id,
    genreId: genre.id,
    publisher: publisherString,
    quantity: 0,
  };
}

type GenerateInvoiceItemProps = BaseScopeProps & {
  invoiceId: Invoice['id'];
};

async function generateInvoiceItem(props: GenerateInvoiceItemProps) {
  const { invoiceId, ...baseProps } = props;

  const book = buildBookCreateInput(baseProps);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, bookId, createdAt, updatedAt, ...data } = fakeInvoiceItem();

  return await createInvoiceItem({
    ...data,
    book,
    invoiceId,
  });
}

type GenerateInvoiceProps = BaseScopeProps & {
  markComplete?: boolean;
  numBooks: number;
  vendor: BookSource;
};

async function generateInvoice(props: GenerateInvoiceProps) {
  const { markComplete, numBooks, vendor, ...baseProps } = props;

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
        generateInvoiceItem({
          invoiceId,
          ...baseProps,
        }),
      { retries: 5 },
    ),
  );
  await Promise.all(invoiceItemPromises);

  if (markComplete) {
    await completeInvoice(invoiceId);
  }
}

type GenerateInvoicesProps = BaseScopeProps & {
  numBooks: number;
  vendors: BookSource[];
};

async function generateInvoices(props: GenerateInvoicesProps) {
  const { numBooks, vendors, ...baseProps } = props;

  // this tries to evenly split up the books, based on if the user
  // requested 0, 1, or more than 1 books created
  let numBooksInvoiceOne = 0;
  let numBooksInvoiceTwo = 0;
  if (numBooks > 0) {
    numBooksInvoiceOne =
      NUM_BOOKS -
      _.random(_.min([NUM_BOOKS - 1, 1])!, _.max([NUM_BOOKS - 1, 1])!);
    numBooksInvoiceTwo = NUM_BOOKS - numBooksInvoiceOne;
  }

  await generateInvoice({
    markComplete: true,
    numBooks: numBooksInvoiceOne,
    vendor: _.sample(vendors) as BookSource,
    ...baseProps,
  });
  await generateInvoice({
    markComplete: true,
    numBooks: numBooksInvoiceTwo,
    vendor: _.sample(vendors) as BookSource,
    ...baseProps,
  });
  await generateInvoice({
    markComplete: false,
    numBooks: 0,
    vendor: _.sample(vendors) as BookSource,
    ...baseProps,
  });
}

type GenerateOrderProps = {
  books: Array<Book>;
  completeOrder?: boolean;
};

async function generateOrder(props: GenerateOrderProps) {
  const { books, completeOrder } = props;

  const order = await createOrder();

  const booksInRandomOrder = _.shuffle(books);
  if (books.length === 0) {
    return;
  } else {
    await createOrderItem({
      bookId: booksInRandomOrder[0].id,
      orderUID: order.orderUID,
      productType: ProductType.BOOK,
      quantity: 1,
    });

    if (books.length > 1) {
      await createOrderItem({
        bookId: booksInRandomOrder[1].id,
        orderUID: order.orderUID,
        productType: ProductType.BOOK,
        quantity: 1,
      });
    }
  }

  if (completeOrder) {
    // TODO we need to fully complete here once the code is available
    await moveOrderToPendingTransactionOrThrow(order.orderUID);
  }
}

async function generateOrders() {
  const books = await prisma.book.findMany();

  await generateOrder({ books, completeOrder: true });
  await generateOrder({ books, completeOrder: false });
}

export default async function generateFakeSeeds() {
  await generateCoreSeeds();

  const formats = await prisma.format.findMany();
  const genres = await prisma.genre.findMany();

  const vendors = await generateVendors(NUM_VENDORS);

  // this represents the "scope" of available authors and publishers
  const authorNames = _.times(NUM_BOOKS, fakeAuthorName);
  const publisherNames = _.times(NUM_BOOKS, fakePublisherName);

  await generateInvoices({
    authorNames,
    formats,
    genres,
    numBooks: NUM_BOOKS,
    publisherNames,
    vendors,
  });

  await generateOrders();
}
