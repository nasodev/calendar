// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Login with invalid credentials', async ({ page }) => {
    // 1. Navigate to http://localhost:23002/login
    await page.goto('http://localhost:23002/login');

    // 2. Enter 'wronguser' in the name field
    await page.getByRole('textbox', { name: '이름' }).fill('wronguser');

    // 3. Enter 'wrongpassword' in the password field
    await page.getByRole('textbox', { name: '비밀번호' }).fill('wrongpassword');

    // 4. Click the login button
    await page.getByRole('button', { name: '로그인' }).click();

    // Verify error message is displayed
    await expect(page.getByText('이름 또는 비밀번호가 틀렸습니다')).toBeVisible();

    // Verify form fields remain populated for retry
    await expect(page.getByRole('textbox', { name: '이름' })).toHaveValue('wronguser');
    await expect(page.getByRole('textbox', { name: '비밀번호' })).toHaveValue('wrongpassword');

    // Verify user remains on login page (no redirect occurs)
    await expect(page).toHaveURL('http://localhost:23002/login');
  });
});
