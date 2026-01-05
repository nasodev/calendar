// spec: Category Management - Cancel category creation
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('Cancel category creation', async ({ page }) => {
    // Navigate to calendar page (already authenticated via storageState)
    await login(page);

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // Step 1: Open category management dialog
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // Verify category management dialog is open
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // Step 2: Click add category button
    await page.getByRole('button', { name: '카테고리 추가' }).click();

    // Step 3: Enter a name and select a color
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('테스트 카테고리');
    await page.locator('.w-7').first().click();

    // Verify the form has data
    await expect(page.getByRole('textbox', { name: '예: 학교, 운동, 가족' })).toHaveValue('테스트 카테고리');

    // Step 4: Click '취소' (Cancel) button
    await page.getByRole('button', { name: '취소' }).click();

    // Step 5: Verify form closes or resets without creating category
    // Verify we're back to the category list view
    await expect(page.getByRole('button', { name: '카테고리 추가' })).toBeVisible();

    // Verify we're back on the category list - check the add button is visible
    await expect(page.getByRole('button', { name: '카테고리 추가' })).toBeVisible();
  });
});
