// spec: Calendar Views - Date navigation in week view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Calendar Views', () => {
  test('Date navigation in week view', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Switch to week view by clicking '주' button
    await page.getByRole('button', { name: '주' }).click();
    await expect(page.getByText('2026년 1월 4일 - 10일')).toBeVisible();

    // 3. Click the left arrow (previous week) button
    await page.getByRole('button').first().click();

    // 4. Verify the header updates to show the previous week's date range
    await expect(page.getByText('12월 28일 - 1월 3일')).toBeVisible();

    // 5. Click the right arrow (next week) button twice
    await page.getByRole('button').nth(1).click();
    await expect(page.getByText('2026년 1월 4일 - 10일')).toBeVisible();

    // 6. Verify the header updates accordingly
    await page.getByRole('button').nth(1).click();
    await expect(page.getByText('2026년 1월 11일 - 17일')).toBeVisible();
  });
});
