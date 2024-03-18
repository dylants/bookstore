import { InvoiceCreateFormInput } from '@/components/invoice/InvoiceCreate';
import BookFormInput from '@/types/BookFormInput';
import { faker } from '@faker-js/faker';
import { test, expect, Page } from '@playwright/test';
import { format } from 'date-fns';
import _ from 'lodash';

type InvoiceCreateFormInputStrings = Omit<
  InvoiceCreateFormInput,
  'vendorId'
> & {
  vendor: string;
};

type BookFormInputStrings = Omit<
  BookFormInput,
  'formatId' | 'genreId' | 'imageUrl' | 'priceInCents'
> & {
  format: string;
  genre: string;
  price: string;
};

async function createInvoice({
  invoice,
  page,
}: {
  invoice: InvoiceCreateFormInputStrings;
  page: Page;
}) {
  await page.getByRole('button', { name: 'New Invoice' }).click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'New Invoice',
  );
  await page.getByLabel('Number').fill(invoice.invoiceNumber);
  await page.getByLabel('Date').fill(format(invoice.invoiceDate, 'yyyy-MM-dd'));
  await page.getByTestId('select-vendor').click();
  await page.getByLabel(invoice.vendor).click();
  await page.getByRole('button', { name: 'Create' }).click();
}

async function verifyInvoiceDetails({
  invoice,
  isComplete,
  page,
}: {
  invoice: InvoiceCreateFormInputStrings;
  isComplete: boolean;
  page: Page;
}) {
  const invoiceDescription = page.getByTestId('invoice-description');
  await expect(invoiceDescription.getByTestId('vendor-name')).toHaveText(
    'Vendor One',
  );
  await expect(
    invoiceDescription.getByTestId('discount-percentage'),
  ).toHaveText('40%');
  await expect(invoiceDescription.getByTestId('invoice-number')).toHaveText(
    invoice.invoiceNumber,
  );
  await expect(invoiceDescription.getByTestId('invoice-date')).toHaveText(
    format(invoice.invoiceDate, 'M/d/yyyy'),
  );

  if (isComplete) {
    await expect(invoiceDescription.getByText('Received')).toBeVisible();
  } else {
    await expect(invoiceDescription.getByText('Received')).not.toBeVisible();
  }
}

async function enterInNewBook({
  book,
  page,
  discountPercentage,
  itemCost,
  totalCost,
}: {
  book: BookFormInputStrings;
  page: Page;
  discountPercentage: string;
  itemCost: string;
  totalCost: string;
}) {
  // enter in an ISBN and press enter
  const skuInput = page.getByLabel('Scan or Enter SKU');
  await skuInput.fill(book.isbn13);
  await skuInput.press('Enter');

  // verify the book form
  await expect(page.getByLabel('ISBN')).toHaveValue(book.isbn13);
  await expect(page.getByLabel('Title')).toHaveValue(book.title);
  await expect(page.getByLabel('Authors')).toHaveValue(book.authors);

  // fill in the custom values
  await page.getByTestId('select-genre').click();
  await page.getByLabel(book.genre, { exact: true }).click();
  await page.getByTestId('select-format').click();
  await page.getByLabel(book.format).click();
  await page.getByLabel('Price').fill(book.price);

  await expect(page.getByLabel('Publisher')).toHaveValue(book.publisher);
  await expect(page.getByLabel('Published Date')).toHaveValue(
    book.publishedDate,
  );
  await expect(page.getByLabel('Quantity')).toHaveValue(book.quantity);

  // add the book, creating the invoice item
  await page.getByRole('button', { name: 'Add' }).click();

  // verify the row added to the table
  const row = page.getByRole('row').nth(1);
  await expect(row).toHaveText(
    `${book.isbn13}${book.title}$${book.price}${discountPercentage}$${itemCost}${book.quantity}$${totalCost}`,
  );
}

async function enterInExistingBook({
  additionalQuantity,
  book,
  page,
  discountPercentage,
  itemCost,
  totalCost,
}: {
  additionalQuantity?: string;
  book: BookFormInputStrings;
  page: Page;
  discountPercentage: string;
  itemCost: string;
  totalCost: string;
}) {
  // enter in an ISBN and press enter
  const skuInput = page.getByLabel('Scan or Enter SKU');
  await skuInput.fill(book.isbn13);
  await skuInput.press('Enter');

  // verify the book form (custom values now show by default)
  await expect(page.getByLabel('ISBN')).toHaveValue(book.isbn13);
  await expect(page.getByLabel('Title')).toHaveValue(book.title);
  await expect(page.getByLabel('Authors')).toHaveValue(book.authors);
  await expect(page.getByTestId('select-genre')).toHaveText(book.genre);
  await expect(page.getByTestId('select-format')).toHaveText(book.format);
  await expect(page.getByLabel('Price')).toHaveValue(book.price);
  await expect(page.getByLabel('Publisher')).toHaveValue(book.publisher);
  await expect(page.getByLabel('Published Date')).toHaveValue(
    book.publishedDate,
  );

  // add additional quantity if asked
  let quantity: string;
  if (additionalQuantity) {
    quantity = additionalQuantity;
    await page.getByLabel('Quantity').fill(additionalQuantity);
  } else {
    quantity = book.quantity;
    await expect(page.getByLabel('Quantity')).toHaveValue(book.quantity);
  }

  // add the book, creating the invoice item
  await page.getByRole('button', { name: 'Add' }).click();

  // verify the row added to the table
  const row = page.getByRole('row').nth(1);
  await expect(row).toHaveText(
    `${book.isbn13}${book.title}$${book.price}${discountPercentage}$${itemCost}${quantity}$${totalCost}`,
  );
}

async function verifyBookDetails({
  book,
  page,
  quantity,
}: {
  book: BookFormInputStrings;
  page: Page;
  quantity: string;
}) {
  const bookComponent = page.getByTestId(book.isbn13);

  await expect(bookComponent.getByText(book.title)).toBeVisible();
  await expect(bookComponent.getByText(`ISBN:${book.isbn13}`)).toBeVisible();
  await expect(bookComponent.getByText(`By:${book.authors}`)).toBeVisible();
  await expect(bookComponent.getByText(`Format:${book.format}`)).toBeVisible();
  await expect(bookComponent.getByText(`Genre:${book.genre}`)).toBeVisible();
  await expect(bookComponent.getByText(`Price:$${book.price}`)).toBeVisible();
  await expect(bookComponent.getByText(`Quantity:${quantity}`)).toBeVisible();
}

test.describe('invoices', () => {
  test('create invoice, add books, complete to add inventory', async ({
    page,
  }) => {
    const invoice: InvoiceCreateFormInputStrings = {
      invoiceDate: faker.date.past(),
      invoiceNumber: faker.finance.accountNumber().toString(),
      vendor: 'Vendor One',
    };

    const book1: BookFormInputStrings = {
      authors: 'Brandon Sanderson',
      format: 'Trade Paperback',
      genre: 'Fantasy',
      isbn13: '9780765376671',
      price: '26.99',
      publishedDate: '2014-03-04',
      publisher: 'Macmillan',
      quantity: '1',
      title: 'The Way of Kings',
    };
    // 40% off of the price
    const book1Cost = '16.19';
    const book1AdditionalQuantity = '3';
    const book1AdditionalQuantityTotalCost = '48.57';

    const book2: BookFormInputStrings = {
      authors: 'Sarah J. Maas',
      format: 'Trade Paperback',
      genre: 'Romance',
      isbn13: '9781635575569',
      price: '19.00',
      publishedDate: '2020-06-02',
      publisher: 'Bloomsbury Publishing USA',
      quantity: '1',
      title: 'A Court of Thorns and Roses',
    };
    // 40% off of the price
    const book2Cost = '11.40';

    await page.goto('/');
    await expect(page.getByRole('main')).toHaveText('Welcome');

    // navigate to the invoices page
    await page.getByRole('navigation').getByTestId('nav-menu').click();
    await page.getByText('Invoices').click();
    await expect(page.getByRole('heading')).toHaveText('Invoices');

    await createInvoice({ invoice, page });

    // find the newly created invoice in the table
    await expect(
      page.getByRole('cell', { name: invoice.invoiceNumber }),
    ).toBeVisible();

    // navigate to the invoice item page
    await page.getByRole('cell', { name: invoice.invoiceNumber }).click();

    await verifyInvoiceDetails({ invoice, isComplete: false, page });

    // create invoice item for book1
    await enterInNewBook({
      book: book1,
      discountPercentage: '40%',
      itemCost: book1Cost,
      page,
      totalCost: book1Cost,
    });

    // create second invoice item for book1
    await enterInExistingBook({
      additionalQuantity: book1AdditionalQuantity,
      book: book1,
      discountPercentage: '40%',
      itemCost: book1Cost,
      page,
      totalCost: book1AdditionalQuantityTotalCost,
    });

    // create invoice item for book2
    await enterInNewBook({
      book: book2,
      discountPercentage: '40%',
      itemCost: book2Cost,
      page,
      totalCost: book2Cost,
    });

    // complete invoice
    await page.getByRole('button', { name: 'Complete Invoice' }).click();

    await verifyInvoiceDetails({ invoice, isComplete: true, page });

    // navigate to the list books page
    await page.getByRole('navigation').getByTestId('nav-menu').click();
    await page.getByText('List').click();
    await expect(page.getByRole('heading')).toHaveText('Books');

    await verifyBookDetails({
      book: book1,
      page,
      quantity: (
        _.toNumber(book1.quantity) + _.toNumber(book1AdditionalQuantity)
      ).toString(),
    });
    await verifyBookDetails({
      book: book2,
      page,
      quantity: book2.quantity,
    });
  });
});
