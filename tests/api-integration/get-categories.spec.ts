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
    // Look for category management button (e.g., "카테고리 관리" or settings icon)
    const categoryButton = page.getByRole('button', { name: /카테고리|설정/ });
    
    // If category management button exists, click it
    if (await categoryButton.count() > 0) {
      await categoryButton.first().click();
      
      // Wait for categories API call
      await page.waitForResponse(response => 
        response.url().includes('/calendar/categories') && response.status() === 200,
        { timeout: 5000 }
      );
    } else {
      // Categories might be loaded on initial page load
      // Wait for API call to complete
      await page.waitForResponse(response => 
        response.url().includes('/calendar/categories') && response.status() === 200,
        { timeout: 5000 }
      );
    }

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
        // Verify id field exists and is a number
        expect(category).toHaveProperty('id');
        expect(typeof category.id).toBe('number');
        
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
    
    // 8. Verify categories are displayed in UI (if any exist)
    if (categoryResponse.data.length > 0) {
      const categoryDialog = page.locator('[role="dialog"]').filter({ hasText: /카테고리/ });
      
      // If category dialog is visible, verify categories are displayed
      if (await categoryDialog.count() > 0) {
        for (const category of categoryResponse.data) {
          // Check if category name appears in the dialog
          const categoryElement = categoryDialog.locator('text=' + category.name);
          await expect(categoryElement).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });
});
