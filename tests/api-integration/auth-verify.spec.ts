// spec: API Integration - GET /calendar/auth/verify endpoint
// Note: Firebase uses IndexedDB, not cookies/localStorage, so storageState doesn't work

import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('GET /calendar/auth/verify endpoint', async ({ page }) => {
    // Set up network monitoring to capture API requests
    const apiRequests: { method: string; url: string; headers: Record<string, string> }[] = [];

    page.on('request', (request) => {
      if (request.url().includes('/calendar/')) {
        apiRequests.push({
          method: request.method(),
          url: request.url(),
          headers: request.headers()
        });
      }
    });

    // Login first (Firebase auth doesn't persist via storageState)
    await page.goto('/login');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // Wait for redirect to calendar and API calls to complete
    await page.waitForURL('http://localhost:23002/');
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible({ timeout: 10000 });

    // Debug: print captured API requests
    console.log('Captured API requests:', apiRequests.map(r => `${r.method} ${r.url}`));

    // Check if auth/verify was called
    const authVerifyReq = apiRequests.find(r => r.url.includes('/auth/verify'));
    expect(authVerifyReq).toBeDefined();

    // Verify Bearer token is sent in Authorization header
    const authHeader = authVerifyReq!.headers['authorization'];
    expect(authHeader).toBeDefined();
    expect(authHeader).toMatch(/^Bearer .+/);
  });
});
