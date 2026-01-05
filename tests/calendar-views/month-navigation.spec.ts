// spec: Calendar Views - Date navigation in month view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Calendar Views', () => {
  test('Date navigation in month view', async ({ page }) => {
    // 1. Login and navigate to calendar in month view
    await login(page);

    // 2. Get the initial month from heading
    const initialHeading = await page.getByRole('heading', { name: /\d{4}년 \d{1,2}월/ }).textContent();

    // 3. Click the left arrow (previous month) button
    const prevButton = page.locator('button').filter({ hasText: /^$/ }).first();
    await prevButton.click();

    // 4. Verify the header changed (navigated to previous month)
    const prevHeading = await page.getByRole('heading', { name: /\d{4}년 \d{1,2}월/ }).textContent();
    expect(prevHeading).not.toBe(initialHeading);

    // 5. Click the right arrow (next month) button to go back
    const nextButton = page.locator('button').filter({ hasText: /^$/ }).nth(1);
    await nextButton.click();

    // 6. Verify we're back at the original month
    const currentHeading = await page.getByRole('heading', { name: /\d{4}년 \d{1,2}월/ }).textContent();
    expect(currentHeading).toBe(initialHeading);
  });
});
