import { test, expect } from '@playwright/test';

test.describe('app', () => {
  test('functions properly', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('main')).toHaveText('Welcome');

    await page.getByRole('navigation').getByText('Orders').click();

    await expect(page.getByRole('heading')).toHaveText('Orders');
  });
});
