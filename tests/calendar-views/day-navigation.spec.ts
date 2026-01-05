// spec: Calendar Views - Date navigation in day view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Calendar Views', () => {
  test('Date navigation in day view', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Switch to day view by clicking '일' button
    await page.getByRole('button', { name: '일', exact: true }).click();

    // 3. Get the initial date from heading
    const initialHeading = await page.getByRole('heading', { name: /\d{4}년 \d{1,2}월 \d{1,2}일/ }).textContent();

    // 4. Click the left arrow (previous day) button - it's the first button with no text
    await page.locator('button').filter({ hasText: /^$/ }).first().click();

    // 5. Verify the header changed (we don't check specific date as it depends on current date)
    const newHeading = await page.getByRole('heading', { name: /\d{4}년 \d{1,2}월 \d{1,2}일/ }).textContent();
    expect(newHeading).not.toBe(initialHeading);

    // 6. The day view should still be displayed
    await expect(page.getByRole('button', { name: '일', exact: true })).toBeVisible();
  });
});
