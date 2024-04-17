import { expect, test, Page } from '@playwright/test';
import { format } from 'date-fns';

type BookStrings = {
  authors: string;
  isbn13: string;
  price: string;
  title: string;
};

type OrderTotal = {
  subTotal: string;
  tax: string;
  total: string;
};

async function addBookToOrder({
  book,
  page,
}: {
  book: BookStrings;
  page: Page;
}) {
  // enter in an ISBN and press enter
  const skuInput = page.getByLabel('SKU');
  await skuInput.fill(book.isbn13);
  await skuInput.press('Enter');

  // TODO remove this after the animation is removed from the start of checkout
  await page.waitForTimeout(1000);

  await expect(page.getByText('Pay Now')).toBeVisible();

  // verify the row added to the table
  const row = page.getByRole('row').nth(1);
  await expect(row).toHaveText(
    `${book.isbn13}${book.title}$${book.price}1$${book.price}`,
  );
}

async function verifyOrderTotal({
  subTotal,
  tax,
  total,
  page,
}: OrderTotal & {
  page: Page;
}) {
  const orderTotal = page.getByTestId('order-total');
  await expect(orderTotal).toHaveText(
    `Subtotal:$${subTotal}Tax:$${tax}Total:$${total}`,
  );
}

async function payNowAndVerifyOrder({
  subTotal,
  tax,
  total,
  page,
}: OrderTotal & {
  page: Page;
}) {
  await page.getByText('Pay Now').click();

  // verify the waiting state
  await expect(page.getByText('Awaiting transaction')).toBeVisible();
  await expect(page.getByText(`Total: $${total}`)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Cancel transaction' }),
  ).toBeVisible();

  // wait for the order to complete, and verify the complete state
  await expect(page.getByText('Checkout complete!')).toBeVisible();
  await expect(page.getByText(`Total: $${total}`)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Start New Checkout' }),
  ).toBeVisible();

  const orderId = await page.getByTestId('order-uid').textContent();

  // navigate to the orders page
  await page.getByRole('navigation').getByText('Orders').click();
  await expect(page.getByRole('heading')).toHaveText('Orders');

  // verify the row added to the table
  const row = page.getByRole('row').nth(1);
  await expect(row).toHaveText(
    `${orderId}Paid${format(new Date(), 'M/d/yyyy')}1$${subTotal}$${tax}$${total}`,
  );
}

async function verifyBookQuantity({
  book,
  quantity,
  page,
}: {
  book: BookStrings;
  quantity: number;
  page: Page;
}) {
  await page.getByRole('navigation').getByText('Search').click();
  await page.getByTestId('search-command-input').fill(book.title);
  await page.getByTestId('search-command-input').press('Enter');
  await page.getByText(`${book.title} by ${book.authors}`).click();

  const bookComponent = page.getByTestId(book.isbn13);

  await expect(bookComponent.getByText(book.title)).toBeVisible();
  await expect(bookComponent.getByText(`ISBN:${book.isbn13}`)).toBeVisible();
  await expect(bookComponent.getByText(`By:${book.authors}`)).toBeVisible();
  await expect(bookComponent.getByText(`Quantity:${quantity}`)).toBeVisible();
}

/**
 * This test assumes inventory exists for the book described below, which
 * should be seeded via the CI seed script.
 *
 * This test assumes Square checkout is being run in sandbox mode, and that
 * the sandbox mode is setup for a successful transaction for orders < $25.
 */
test.describe('checkout', () => {
  test('checkout book with inventory, and successful square transaction', async ({
    page,
  }) => {
    const book1: BookStrings = {
      authors: 'Sarah J. Maas',
      isbn13: '9781635575583',
      price: '19.99',
      title: 'A Court of Mist and Fury',
    };
    const orderTotal: OrderTotal = {
      subTotal: '19.99',
      tax: '1.65',
      total: '21.64',
    };
    // we have 5 to start, and we're buying 1, so we'll have 4 remaining
    const QUANTITY_REMAINING = 4;

    await page.goto('/');
    await expect(page.getByRole('main')).toHaveText('Welcome');

    // navigate to the checkout page
    await page.getByRole('navigation').getByText('Checkout').click();
    await expect(page.getByRole('heading')).toHaveText('Checkout');

    await addBookToOrder({ book: book1, page });

    await verifyOrderTotal({
      page,
      ...orderTotal,
    });

    await payNowAndVerifyOrder({
      page,
      ...orderTotal,
    });

    await verifyBookQuantity({
      book: book1,
      page,
      quantity: QUANTITY_REMAINING,
    });
  });
});
