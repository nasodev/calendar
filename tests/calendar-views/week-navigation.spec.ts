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

    // Get the initial week header text (contains date range pattern like "1월 12일 - 18일")
    const weekHeader = page.getByRole('heading', { level: 2 });
    const initialText = await weekHeader.textContent();
    expect(initialText).toMatch(/\d+월.*\d+일.*-.*\d+일/);

    // 3. Click the left arrow (previous week) button
    await page.getByRole('button').first().click();

    // 4. Verify the header updates to show a different date range
    await expect(weekHeader).not.toHaveText(initialText!);
    const prevWeekText = await weekHeader.textContent();
    expect(prevWeekText).toMatch(/\d+월.*\d+일.*-.*\d+일/);

    // 5. Click the right arrow (next week) button to return to original week
    await page.getByRole('button').nth(1).click();
    await expect(weekHeader).toHaveText(initialText!);

    // 6. Click right arrow again to go to next week
    await page.getByRole('button').nth(1).click();
    await expect(weekHeader).not.toHaveText(initialText!);
  });
});
