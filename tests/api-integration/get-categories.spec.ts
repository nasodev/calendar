// spec: API Integration - GET /calendar/categories endpoint
// seed: tests/seed.spec.ts (uses storageState authentication)

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test('GET /calendar/categories endpoint', async ({ page }) => {
    // Set up response listener for /calendar/categories endpoint
    const apiResponses: any[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/calendar/categories')) {
        try {
          const responseData = await response.json();
          
          apiResponses.push({
            url,
            status: response.status(),
            data: responseData,
          });
        } catch (error) {
          // Handle non-JSON responses
          console.error('Failed to parse response:', error);
        }
      }
    });

    // 1. Navigate to calendar (already authenticated via storageState)
    await login(page);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // 2. Open category management dialog
    // The category button is the third icon button (after navigation arrows)
    // It has no text content, so we select by position
    const categoryButton = page.getByRole('button').filter({ hasText: /^$/ }).nth(2);

    // Click the category management button
    await categoryButton.click();

    // Wait for dialog to appear
    await expect(page.getByRole('dialog', { name: '카테고리 관리' })).toBeVisible();

    // Categories should now be loaded - check if we captured any responses
    // Wait a bit for API call to complete
    await page.waitForTimeout(500);

    // 3. Verify GET request to /calendar/categories was made
    expect(apiResponses.length).toBeGreaterThan(0);
    const categoryResponse = apiResponses[0];

    // 4. Verify response status is 200
    expect(categoryResponse.status).toBe(200);

    // 5. Verify response contains array of categories
    expect(Array.isArray(categoryResponse.data)).toBe(true);

    // 6. Verify each category has required fields: id, name, color
    if (categoryResponse.data.length > 0) {
      for (const category of categoryResponse.data) {
        // Verify id field exists (can be number or string)
        expect(category).toHaveProperty('id');
        expect(category.id).toBeDefined();
        
        // Verify name field exists and is a string
        expect(category).toHaveProperty('name');
        expect(typeof category.name).toBe('string');
        expect(category.name.length).toBeGreaterThan(0);
        
        // Verify color field exists and is a valid hex color
        expect(category).toHaveProperty('color');
        expect(typeof category.color).toBe('string');
        expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }

    // 7. Verify empty array is handled gracefully
    // Even if no categories exist, the response should be a valid empty array
    expect(Array.isArray(categoryResponse.data)).toBe(true);
    
    // 8. API test complete - we've verified the response structure
    // UI verification is covered by category-management tests
  });
});
