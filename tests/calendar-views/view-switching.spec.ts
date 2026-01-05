// spec: Calendar Views - Switch between calendar views
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Calendar Views', () => {
  test('Switch between calendar views', async ({ page }) => {
    // 1. Login and navigate to calendar (starts in month view)
    await login(page);

    // Verify month view is displayed by default (format: YYYY년 M월)
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();

    // 2. Click '주' (Week) button and verify week view is displayed
    await page.getByRole('button', { name: '주' }).click();
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월 \d{1,2}일 - \d{1,2}일/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();

    // 3. Click '일' (Day) button and verify day view is displayed
    await page.getByRole('button', { name: '일', exact: true }).click();
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월 \d{1,2}일$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '일', exact: true })).toBeVisible();

    // 4. Click '월' (Month) button and verify month view is displayed
    await page.getByRole('button', { name: '월' }).click();
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();
  });
});
