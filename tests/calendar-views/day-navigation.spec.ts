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

    // 3. Click the left arrow (previous day) button
    await page.getByRole('button').first().click();

    // 4. Verify the header updates to show the previous day
    await expect(page.getByRole('heading', { name: '2026년 1월 3일' })).toBeVisible();

    // 5. Click the right arrow (next day) button twice
    await page.getByRole('button').nth(1).click();
    await page.getByRole('button').nth(1).click();

    // 6. Verify the header updates accordingly
    await expect(page.getByRole('heading', { name: '2026년 1월 5일' })).toBeVisible();
  });
});
