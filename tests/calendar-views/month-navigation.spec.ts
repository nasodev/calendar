// spec: Calendar Views - Date navigation in month view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Calendar Views', () => {
  test('Date navigation in month view', async ({ page }) => {
    // 1. Login and navigate to calendar in month view
    await login(page);

    // 2. Click the left arrow (previous month) button
    const prevButton = page.getByRole('button').first();
    const nextButton = page.getByRole('button').nth(1);
    
    await prevButton.click();

    // 3. Verify the header updates to show the previous month (e.g., '2025년 12월')
    await expect(page.getByText('2025년 12월')).toBeVisible();

    // 4. Click the right arrow (next month) button twice
    await nextButton.click();

    // 5. Verify the header updates to show the next month (e.g., '2026년 1월')
    await expect(page.getByText('2026년 1월')).toBeVisible();

    await nextButton.click();

    // Verify the header updates to show February 2026
    await expect(page.getByText('2026년 2월')).toBeVisible();
  });
});
