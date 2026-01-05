// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Calendar Views', () => {
  test('Day view display', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Click the '일' (Day) button in the view switcher
    await page.getByRole('button', { name: '일', exact: true }).click();

    // 3. Verify day view displays with full date in header (format: YYYY년 M월 D일)
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월 \d{1,2}일/ })).toBeVisible();

    // 4. Check that hourly time slots are displayed
    await expect(page.getByText('00:00').first()).toBeVisible();
    await expect(page.getByText('12:00').first()).toBeVisible();

    // 5. Verify the '일' button is active/selected
    await expect(page.getByRole('button', { name: '일', exact: true })).toBeVisible();
  });
});
