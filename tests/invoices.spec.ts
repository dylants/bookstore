import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';

test.describe('invoices', () => {
  test('create invoice, add items, complete to add inventory', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toHaveText('Welcome');

    // navigate to the invoices page
    await page.getByRole('navigation').getByTestId('nav-menu').click();
    await page.getByText('Invoices').click();
    await expect(page.getByRole('heading')).toHaveText('Invoices');

    // create new invoice
    const invoiceNumber = faker.finance.accountNumber().toString();
    await page.getByRole('button', { name: 'New Invoice' }).click();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(
      'New Invoice',
    );
    await page.getByLabel('Number').fill(invoiceNumber);
    await page.getByLabel('Date').fill('2024-03-01');
    await page.getByTestId('select-vendor').click();
    await page.getByLabel('Vendor One').click();
    await page.getByRole('button', { name: 'Create' }).click();

    // find the newly created invoice in the table
    await expect(page.getByRole('cell', { name: invoiceNumber })).toBeVisible();

    // navigate to the invoice item page
    await page.getByRole('cell', { name: invoiceNumber }).click();

    // verify the invoice details are shown
    await expect(
      page.getByTestId('invoice-description').getByText('Vendor One'),
    ).toBeVisible();
    await expect(page.getByTestId('discount-percentage')).toHaveText('40%');

    // TODO add items and complete
  });
});
