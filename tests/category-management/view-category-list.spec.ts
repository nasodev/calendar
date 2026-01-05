// spec: Category Management - View all categories in list
// Authentication: Uses storageState (.auth/user.json) - NO login code

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('View all categories in list', async ({ page }) => {
    // Navigate to calendar page (already authenticated via storageState)
    await login(page);

    // Wait for calendar page to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // Step 1: Create several categories with different names and colors
    // Open category management (icon button without text)
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // Wait for category dialog
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // Create first category: 개인 (Personal)
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('개인');
    await page.locator('.flex.flex-wrap > button').first().click();
    await page.getByRole('button', { name: '추가' }).click();

    // Wait for the category to be saved
    await expect(page.getByText('개인').first()).toBeVisible();

    // Create second category: 업무 (Work)
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('업무');
    await page.locator('.flex.flex-wrap > button').nth(1).click();
    await page.getByRole('button', { name: '추가' }).click();

    // Wait for the category to be saved
    await expect(page.getByText('업무').first()).toBeVisible();

    // Step 2: Category management dialog should still be open
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // Step 3: Verify categories are displayed in a list
    await expect(page.getByText('개인').first()).toBeVisible();
    await expect(page.getByText('업무').first()).toBeVisible();
  });
});
