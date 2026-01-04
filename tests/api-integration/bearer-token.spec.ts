// spec: API Integration - Bearer Token Injection
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test('API Bearer token injection', async ({ page }) => {
    // Set up network request listener to capture API headers
    const apiRequests: { url: string; headers: Record<string, string> }[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('localhost:28000')) {
        apiRequests.push({
          url,
          headers: request.headers()
        });
      }
    });

    // 1. Navigate to calendar page (already authenticated via storageState)
    await login(page);

    // Wait for API calls to complete
    await page.waitForLoadState('networkidle');

    // 2. Verify Authorization header is present in API requests
    expect(apiRequests.length).toBeGreaterThan(0);

    // 3. Verify Authorization header format is 'Bearer {token}'
    for (const request of apiRequests) {
      const authHeader = request.headers['authorization'];
      
      // 4. Verify Authorization header contains 'Bearer {token}'
      expect(authHeader).toBeDefined();
      expect(authHeader).toMatch(/^Bearer .+/);
      
      // 5. Verify token is a valid Firebase token (non-empty JWT format)
      const token = authHeader.split('Bearer ')[1];
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(100); // JWT tokens are typically long
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    }
  });
});
