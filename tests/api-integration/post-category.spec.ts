import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test('POST /calendar/categories endpoint', async ({ page }) => {
    // 1. Navigate to calendar page (already authenticated via storageState)
    await login(page);

    // 2. Open category management dialog
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // 3. Click add category button to open new category form
    await page.getByRole('button', { name: '카테고리 추가' }).click();

    // 4. Enter category name
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('테스트 카테고리');

    // 5. Select a color
    await page.locator('.flex.flex-wrap > button:nth-child(2)').click();

    // 6. Set up response promise before clicking
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/calendar/categories') && response.request().method() === 'POST'
    );

    // 7. Click add button to create the category
    await page.getByRole('button', { name: '추가' }).click();

    // 8. Wait for API response
    const response = await responsePromise;

    // 9. Verify response status
    expect(response.status()).toBe(201);

    // 10. Verify response body structure
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('name', '테스트 카테고리');
    expect(responseBody).toHaveProperty('color');
    expect(responseBody.color).toMatch(/^#[0-9A-F]{6}$/i);

    // 11. Verify request body
    const requestPostData = response.request().postDataJSON();
    expect(requestPostData).toHaveProperty('name', '테스트 카테고리');
    expect(requestPostData).toHaveProperty('color');
    expect(requestPostData.color).toMatch(/^#[0-9A-F]{6}$/i);

    // 12. Verify new category appears in UI immediately (use first() to avoid strict mode violation)
    await expect(page.getByText('테스트 카테고리').first()).toBeVisible();
  });
});
