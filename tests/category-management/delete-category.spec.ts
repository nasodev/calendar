// spec: Category Management - Delete category
// Authentication: Uses storageState (.auth/user.json) - NO login code

import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {
  test('Delete category', async ({ page }) => {
    // Navigate to calendar page (already authenticated via storageState)
    await page.goto('/');

    // Wait for calendar page to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // Open category management dialog
    await page.getByRole('button', { name: '카테고리' }).click();

    // Wait for category dialog
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // 1. Create a test category
    await page.getByRole('button', { name: '새 카테고리' }).click();
    await page.getByLabel('카테고리 이름').fill('삭제테스트');
    // Select a color
    await page.locator('button[role="radio"]').first().click();
    await page.getByRole('button', { name: '저장' }).click();

    // Wait for the category to be saved and visible
    await expect(page.getByText('삭제테스트')).toBeVisible();

    // 2. Find delete option on the created category
    // The delete button is a Trash2 icon button next to the category
    const categoryRow = page.locator('div').filter({ hasText: /^삭제테스트$/ }).locator('..'); // parent container
    const deleteButton = categoryRow.getByRole('button').filter({ has: page.locator('svg') }).nth(1); // Second button is delete (first is edit)

    // 3. Click delete button for the category
    await deleteButton.click();

    // 4. Verify category is removed from list
    // The category should no longer be visible after deletion
    await expect(page.getByText('삭제테스트')).not.toBeVisible();

    // Close the dialog and verify the category is gone from the backend
    await page.keyboard.press('Escape');
    
    // Reopen category dialog to verify deletion persisted
    await page.getByRole('button', { name: '카테고리' }).click();
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();
    
    // 5. Verify category no longer appears in lists
    await expect(page.getByText('삭제테스트')).not.toBeVisible();
  });
});
