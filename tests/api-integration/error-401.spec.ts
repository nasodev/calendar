// spec: API Integration - API error handling - 401 Unauthorized
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('API error handling - 401 Unauthorized', async ({ page }) => {
    // Step 1: Set up route interception to simulate 401 error
    await page.route('**/calendar/**', async (route) => {
      // Intercept all API calls to the calendar backend and return 401
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Unauthorized' }),
      });
    });

    // Step 2: Navigate to the calendar page (simulating an authenticated user with expired token)
    await page.goto('http://localhost:23002/');

    // Step 3: Verify 401 response is handled - user should be redirected to login
    // Wait for redirect to login page
    await page.waitForURL('http://localhost:23002/login', { timeout: 10000 });

    // Step 4: Check if user is redirected to login
    // Verify we're on the login page
    await expect(page).toHaveURL('http://localhost:23002/login');

    // Verify login form is visible
    await expect(page.getByRole('textbox', { name: '이름' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '비밀번호' })).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();

    // Expected Results verification:
    // - 401 errors are caught by frontend ✓ (intercepted and handled)
    // - User is logged out and redirected to login page ✓ (URL changed to /login)
    // - Appropriate error message is shown (login form visible)
    // - Session is cleared (redirected to login indicates session cleared)
  });
});
