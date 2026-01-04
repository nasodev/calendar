// spec: Authentication - Protected route access without authentication
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Protected route access without authentication', async ({ page }) => {
    // 1. Navigate directly to the main calendar page without authentication
    await page.goto('http://localhost:23002/');

    // 2. Wait for redirect to login page to complete
    await expect(page).toHaveURL('http://localhost:23002/login');

    // 3. Verify redirect to login page - verify login page elements are visible
    await expect(page.getByText('가족 캘린더')).toBeVisible();
    await expect(page.getByRole('textbox', { name: '이름' })).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });
});
