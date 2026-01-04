// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Password visibility toggle', async ({ page }) => {
    // 1. Navigate to http://localhost:23002/login
    await page.goto('http://localhost:23002/login');

    // 2. Enter a password in the password field
    await page.getByRole('textbox', { name: '비밀번호' }).fill('testpassword123');

    // 3. Verify password is masked by default
    const passwordInput = page.getByRole('textbox', { name: '비밀번호' });
    await expect(passwordInput).toHaveValue('testpassword123');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 4. Click the eye icon button next to password field
    await page.locator('form').getByRole('button').filter({ hasText: /^$/ }).click();

    // 5. Verify password becomes visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // 6. Click the eye icon button again
    await page.locator('form').getByRole('button').filter({ hasText: /^$/ }).click();

    // Verify password is masked again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
