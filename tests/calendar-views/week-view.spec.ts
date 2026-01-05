// spec: Calendar Views
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Calendar Views', () => {
  test('Week view display', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Click the '주' (Week) button in the view switcher
    await page.getByRole('button', { name: '주' }).click();

    // 3. Verify week view displays with date range in header (format: YYYY년 M월 D일 - D일)
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월 \d{1,2}일 - \d{1,2}일/ })).toBeVisible();

    // 4. Verify hourly time slots are displayed
    await expect(page.getByText('00:00').first()).toBeVisible();
    await expect(page.getByText('12:00').first()).toBeVisible();

    // 5. Verify the '주' button is active/selected
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();
  });
});
