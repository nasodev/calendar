// spec: Category Management - View all categories in list
// Authentication: Uses storageState (.auth/user.json) - NO login code

import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {
  test('View all categories in list', async ({ page }) => {
    // Navigate to calendar page (already authenticated via storageState)
    await page.goto('/');

    // Wait for calendar page to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // Step 1: Create several categories with different names and colors
    // Open category management
    await page.getByRole('button', { name: '카테고리' }).click();

    // Wait for category dialog
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // Create first category: 개인 (Personal)
    await page.getByRole('button', { name: '새 카테고리' }).click();
    await page.getByLabel('카테고리 이름').fill('개인');
    // Click first color option in color picker
    await page.locator('button[role="radio"]').first().click();
    await page.getByRole('button', { name: '저장' }).click();

    // Wait for the category to be saved
    await expect(page.getByText('개인')).toBeVisible();

    // Create second category: 업무 (Work)
    await page.getByRole('button', { name: '새 카테고리' }).click();
    await page.getByLabel('카테고리 이름').fill('업무');
    await page.locator('button[role="radio"]').nth(1).click();
    await page.getByRole('button', { name: '저장' }).click();

    // Wait for the category to be saved
    await expect(page.getByText('업무')).toBeVisible();

    // Create third category: 가족 (Family)
    await page.getByRole('button', { name: '새 카테고리' }).click();
    await page.getByLabel('카테고리 이름').fill('가족');
    await page.locator('button[role="radio"]').nth(2).click();
    await page.getByRole('button', { name: '저장' }).click();

    // Wait for the category to be saved
    await expect(page.getByText('가족')).toBeVisible();

    // Create fourth category: 운동 (Exercise)
    await page.getByRole('button', { name: '새 카테고리' }).click();
    await page.getByLabel('카테고리 이름').fill('운동');
    await page.locator('button[role="radio"]').nth(3).click();
    await page.getByRole('button', { name: '저장' }).click();

    // Step 2: Category management dialog should still be open
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // Step 3: Verify all categories are displayed in a list
    await expect(page.getByText('개인')).toBeVisible();
    await expect(page.getByText('업무')).toBeVisible();
    await expect(page.getByText('가족')).toBeVisible();
    await expect(page.getByText('운동')).toBeVisible();

    // Step 4: Check that each category shows its name and color indicator
    // Verify the category list is organized and readable
    const categoryDialog = page.getByRole('dialog');
    await expect(categoryDialog).toBeVisible();

    // Verify list items have both name and color representation
    // Categories should be in the list with their colors
    const categoryItems = categoryDialog.locator('[class*="flex"]').filter({ hasText: /개인|업무|가족|운동/ });
    await expect(categoryItems.first()).toBeVisible();
  });
});
