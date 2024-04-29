import { test, expect, Page } from '@playwright/test';

type BookInventoryAdjustmentType = {
  authors: string;
  isbn13: string;
  quantity: number;
  title: string;
};

async function verifyBookDetails({
  book,
  page,
  quantity,
}: {
  book: BookInventoryAdjustmentType;
  page: Page;
  quantity: number;
}) {
  const bookComponent = page.getByTestId(book.isbn13);

  await expect(bookComponent.getByText(book.title)).toBeVisible();
  await expect(bookComponent.getByText(`ISBN:${book.isbn13}`)).toBeVisible();
  await expect(bookComponent.getByText(`By:${book.authors}`)).toBeVisible();
  await expect(bookComponent.getByText(`Quantity:${quantity}`)).toBeVisible();
}

test.describe('inventory adjustment', () => {
  test('update inventory for a book', async ({ page }) => {
    const book1: BookInventoryAdjustmentType = {
      authors: 'Brandon Sanderson',
      isbn13: '9781250868282',
      quantity: 2,
      title: 'Mistborn',
    };
    const updatedQuantity = 0;

    await page.goto('/');
    await expect(page.getByRole('heading')).toHaveText('Bookstore');

    // navigate to the book details page
    await page.getByRole('navigation').getByText('Search').click();
    await page.getByTestId('search-command-input').fill(book1.title);
    await page.getByTestId('search-command-input').press('Enter');
    await page.getByText(`${book1.title} by ${book1.authors}`).click();

    await verifyBookDetails({
      book: book1,
      page,
      quantity: book1.quantity,
    });

    // adjust inventory
    await page.getByRole('button', { name: 'Inventory Adjustment' }).click();
    await expect(page.getByRole('heading')).toHaveText('Inventory Adjustment');
    await page.getByLabel('Quantity').fill(updatedQuantity.toString());
    await page.getByTestId('select-reason').click();
    await page.getByLabel('Incorrect Inventory').click();
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(
      page.getByRole('heading', { name: 'Inventory Adjustment' }),
    ).toBeHidden();
    await verifyBookDetails({
      book: book1,
      page,
      quantity: updatedQuantity,
    });
  });
});
