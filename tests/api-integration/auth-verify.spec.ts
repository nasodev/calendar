// spec: API Integration - GET /calendar/auth/verify endpoint
// Authentication: Uses storageState (.auth/user.json)

import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('GET /calendar/auth/verify endpoint', async ({ page }) => {
    // Set up network monitoring to capture the auth/verify request
    let authVerifyRequest: any = null;
    let authVerifyResponse: any = null;

    // 1. Capture the auth/verify API request
    page.on('request', (request) => {
      if (request.url().includes('/calendar/auth/verify')) {
        authVerifyRequest = request;
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('/calendar/auth/verify')) {
        authVerifyResponse = response;
      }
    });

    // 2. Navigate to calendar application (already authenticated via storageState)
    await page.goto('/');

    // Wait for the auth/verify request to complete
    await page.waitForResponse(response => 
      response.url().includes('/calendar/auth/verify') && response.status() === 200
    );

    // 3. Verify Bearer token is sent in Authorization header
    expect(authVerifyRequest).not.toBeNull();
    const authHeader = authVerifyRequest.headers()['authorization'];
    expect(authHeader).toBeDefined();
    expect(authHeader).toMatch(/^Bearer .+/);

    // 4. Verify response contains member profile data
    expect(authVerifyResponse).not.toBeNull();
    expect(authVerifyResponse.status()).toBe(200);

    const responseBody = await authVerifyResponse.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('name');
    expect(responseBody).toHaveProperty('email');
    expect(responseBody.email).toMatch(/@kidchat\.local$/);

    // 5. Verify member profile is used in application
    // The calendar page should be visible, indicating successful authentication
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
