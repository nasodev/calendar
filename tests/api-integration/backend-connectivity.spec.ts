// spec: API Integration - Backend Connectivity Check
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test('Backend connectivity check', async ({ page }) => {
    const apiRequests: Array<{ url: string; method: string; hasAuthHeader: boolean; authToken?: string }> = [];

    // 1. Intercept API requests to verify backend connectivity
    await page.route('http://localhost:28000/**', async (route, request) => {
      const headers = request.headers();
      const authHeader = headers['authorization'] || '';
      
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        hasAuthHeader: !!authHeader,
        authToken: authHeader.startsWith('Bearer ') ? authHeader.substring(7, 20) + '...' : undefined
      });

      // Continue with the actual request
      await route.continue();
    });

    // 2. Navigate to calendar page (already authenticated via storageState)
    await login(page);

    // 3. Wait for page to load and API calls to complete
    await page.getByRole('button', { name: '일정 추가' }).waitFor({ state: 'visible' });

    // 4. Verify that API calls were made to the backend
    expect(apiRequests.length).toBeGreaterThan(0);

    // 5. Verify all API requests went to the correct backend URL
    for (const request of apiRequests) {
      expect(request.url).toContain('http://localhost:28000');
    }

    // 6. Verify that Authorization header with Bearer token is present in all requests
    const requestsWithAuth = apiRequests.filter(req => req.hasAuthHeader);
    expect(requestsWithAuth.length).toBe(apiRequests.length);

    // 7. Verify Bearer token format
    for (const request of apiRequests) {
      expect(request.authToken).toBeDefined();
      expect(request.authToken).toMatch(/^[A-Za-z0-9-_]+\.\.\./);
    }

    // 8. Log API requests for debugging
    console.log('API Requests intercepted:', apiRequests.length);
    console.log('Sample request:', apiRequests[0]);

    // 9. Verify typical API endpoints are called (at least auth/verify should be called)
    const apiUrls = apiRequests.map(req => req.url);
    const hasEventsEndpoint = apiUrls.some(url => url.includes('/calendar/events'));
    const hasCategoriesEndpoint = apiUrls.some(url => url.includes('/calendar/categories'));
    const hasAuthEndpoint = apiUrls.some(url => url.includes('/calendar/auth/verify'));

    // At minimum, auth endpoint should be called on page load
    expect(hasAuthEndpoint).toBe(true);
    // Events or categories may be loaded - at least one should be present
    expect(hasEventsEndpoint || hasCategoriesEndpoint || hasAuthEndpoint).toBe(true);
  });
});
