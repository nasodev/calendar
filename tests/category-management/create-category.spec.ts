// spec: Category Management
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('Create new category', async ({ page }) => {
    // Navigate and login
    await login(page);

    // 2. Open category management dialog
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // 3. Click the add category button
    await page.getByRole('button', { name: '카테고리 추가' }).click();

    // 4. Enter a category name
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('업무');

    // 5. Select a color for the category
    await page.getByRole('button').first().click();

    // 6. Save the category
    await page.getByRole('button', { name: '추가' }).click();

    // 7. Verify the new category appears in the list
    await expect(page.getByText('업무').first()).toBeVisible();
  });
});
