// spec: API Integration - GET /calendar/events endpoint
// seed: tests/seed.spec.ts (uses storageState authentication)

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test('GET /calendar/events endpoint', async ({ page }) => {
    // Set up response listener for /calendar/events endpoint
    const apiResponses: any[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/calendar/events')) {
        const urlObj = new URL(url);
        const responseData = await response.json();
        
        apiResponses.push({
          url,
          status: response.status(),
          params: {
            start_date: urlObj.searchParams.get('start_date'),
            end_date: urlObj.searchParams.get('end_date'),
          },
          data: responseData,
        });
      }
    });

    // 1. Navigate to calendar (already authenticated via storageState)
    await login(page);
    
    // Wait for initial API call to complete
    await page.waitForResponse(response => 
      response.url().includes('/calendar/events') && response.status() === 200
    );

    // Verify initial API call
    expect(apiResponses.length).toBeGreaterThan(0);
    const initialResponse = apiResponses[0];

    // 2. Verify GET request includes start_date and end_date query parameters
    expect(initialResponse.params.start_date).toBeTruthy();
    expect(initialResponse.params.end_date).toBeTruthy();
    expect(initialResponse.params.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(initialResponse.params.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // 3. Verify response contains { events: [...] } structure
    expect(initialResponse.data).toHaveProperty('events');
    expect(Array.isArray(initialResponse.data.events)).toBe(true);

    // 4. Verify events include all required fields
    if (initialResponse.data.events.length > 0) {
      const event = initialResponse.data.events[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('start');
      expect(event).toHaveProperty('end');
    }

    // Clear previous responses
    apiResponses.length = 0;

    // 5. Change calendar view to trigger new API call
    const viewButtons = page.locator('button').filter({ hasText: /주|일/ });
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      
      // Wait for new API call
      await page.waitForResponse(response => 
        response.url().includes('/calendar/events') && response.status() === 200,
        { timeout: 5000 }
      );

      // Verify new API call was made
      expect(apiResponses.length).toBeGreaterThan(0);
      const viewChangeResponse = apiResponses[apiResponses.length - 1];
      
      // Verify new parameters
      expect(viewChangeResponse.params.start_date).toBeTruthy();
      expect(viewChangeResponse.params.end_date).toBeTruthy();
      
      // Verify response structure
      expect(viewChangeResponse.data).toHaveProperty('events');
      expect(Array.isArray(viewChangeResponse.data.events)).toBe(true);
    }

    // Clear responses again
    apiResponses.length = 0;

    // 6. Navigate to different date range
    const nextButton = page.locator('button[aria-label*="다음"], button').filter({ hasText: '›' });
    if (await nextButton.count() > 0) {
      await nextButton.first().click();
      
      // Wait for API call after navigation
      await page.waitForResponse(response => 
        response.url().includes('/calendar/events') && response.status() === 200,
        { timeout: 5000 }
      );

      // Verify API call was made with new date range
      expect(apiResponses.length).toBeGreaterThan(0);
      const navigationResponse = apiResponses[apiResponses.length - 1];
      
      expect(navigationResponse.params.start_date).toBeTruthy();
      expect(navigationResponse.params.end_date).toBeTruthy();
      expect(navigationResponse.data).toHaveProperty('events');
    }

    // 7. Verify recurring events include occurrence_date
    const allEvents = apiResponses.flatMap(r => r.data.events || []);
    const recurringEvents = allEvents.filter(e => e.recurrence_pattern);
    
    if (recurringEvents.length > 0) {
      for (const event of recurringEvents) {
        expect(event).toHaveProperty('occurrence_date');
        expect(event.occurrence_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});
