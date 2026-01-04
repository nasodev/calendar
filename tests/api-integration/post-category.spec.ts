import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('POST /calendar/categories endpoint', async ({ page }) => {
    // 1. Navigate to calendar page (already authenticated via storageState)
    await page.goto('/');

    // 2. Open category management dialog
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // 3. Click add category button to open new category form
    await page.getByRole('button', { name: '카테고리 추가' }).click();

    // 4. Set up fetch interception to capture POST request and response
    await page.addInitScript(() => {
      window.capturedRequest = null;
      window.capturedResponse = null;
      
      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const url = args[0];
        const options = args[1] || {};
        
        if (url.includes('/calendar/categories') && options.method === 'POST') {
          window.capturedRequest = {
            url: url,
            method: options.method,
            body: options.body ? JSON.parse(options.body) : null,
            headers: options.headers
          };
        }
        
        const response = await originalFetch.apply(this, args);
        
        if (url.includes('/calendar/categories') && options.method === 'POST') {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          window.capturedResponse = {
            status: response.status,
            data: data
          };
        }
        
        return response;
      };
    });

    // 5. Enter category name
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('테스트 카테고리');

    // 6. Select a color
    await page.locator('.flex.flex-wrap > button:nth-child(2)').click();

    // 7. Set up response promise before clicking
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/calendar/categories') && response.request().method() === 'POST'
    );

    // 8. Click add button to create the category
    await page.getByRole('button', { name: '추가' }).click();

    // 9. Wait for API response
    const response = await responsePromise;

    // 10. Verify response status
    expect(response.status()).toBe(201);

    // 11. Verify response body structure
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('name', '테스트 카테고리');
    expect(responseBody).toHaveProperty('color');
    expect(responseBody.color).toMatch(/^#[0-9A-F]{6}$/i);

    // 12. Verify request body
    const requestPostData = response.request().postDataJSON();
    expect(requestPostData).toHaveProperty('name', '테스트 카테고리');
    expect(requestPostData).toHaveProperty('color');
    expect(requestPostData.color).toMatch(/^#[0-9A-F]{6}$/i);

    // 13. Verify new category appears in UI immediately
    await expect(page.getByText('테스트 카테고리')).toBeVisible();
  });
});
