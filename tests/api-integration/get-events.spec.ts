// spec: API Integration - GET /calendar/events endpoint
// seed: tests/seed.spec.ts (uses storageState authentication)

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test('GET /calendar/events endpoint', async ({ page }) => {
    // 1. Navigate to calendar and login
    await login(page);

    // Wait for initial API call to complete and capture the response
    const initialResponse = await page.waitForResponse(response =>
      response.url().includes('/calendar/events') && response.status() === 200
    );

    // Parse response
    const urlObj = new URL(initialResponse.url());
    const responseData = await initialResponse.json();

    // 2. Verify GET request includes start_date and end_date query parameters
    const startDate = urlObj.searchParams.get('start_date');
    const endDate = urlObj.searchParams.get('end_date');

    expect(startDate).toBeTruthy();
    expect(endDate).toBeTruthy();
    expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // 3. Verify response contains { events: [...] } structure
    expect(responseData).toHaveProperty('events');
    expect(Array.isArray(responseData.events)).toBe(true);

    // 4. Verify events include all required fields (if any events exist)
    if (responseData.events.length > 0) {
      const event = responseData.events[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      // Check for either 'start' or 'start_time' (backend might use different naming)
      expect(event.start || event.start_time).toBeDefined();
      expect(event.end || event.end_time).toBeDefined();

      // 5. Verify recurring events include occurrence_date (if any exist)
      const recurringEvents = responseData.events.filter((e: any) => e.recurrence_pattern);

      if (recurringEvents.length > 0) {
        for (const recurringEvent of recurringEvents) {
          expect(recurringEvent).toHaveProperty('occurrence_date');
          expect(recurringEvent.occurrence_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      }
    }
  });
});
