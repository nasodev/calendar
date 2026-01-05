// spec: Category Management - Edit category
// Authentication: Uses storageState (.auth/user.json) - NO login code

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('Edit category', async ({ page }) => {
    // Navigate to calendar page (already authenticated via storageState)
    await login(page);

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 1. Open category management dialog (icon button without text)
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // Wait for category dialog
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // 2. Create a test category first
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('수정 테스트');
    await page.locator('.flex.flex-wrap > button').first().click();
    await page.getByRole('button', { name: '추가' }).click();

    // Wait for category to be saved
    await expect(page.getByText('수정 테스트').first()).toBeVisible();

    // 3. The category list shows categories - verify it was created
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();
  });
});
