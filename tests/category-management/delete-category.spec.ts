// spec: Category Management - Delete category
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('Delete category', async ({ page }) => {
    // Navigate to calendar page
    await login(page);

    // Wait for calendar page to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // Open category management dialog (icon button without text)
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // Wait for category dialog
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // 1. Create a test category
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('삭제테스트');
    await page.locator('.flex.flex-wrap > button').first().click();
    await page.getByRole('button', { name: '추가' }).click();

    // Wait for the category to be saved and visible
    await expect(page.getByText('삭제테스트').first()).toBeVisible();

    // 2. Verify category management dialog is still open
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // Close the dialog
    await page.keyboard.press('Escape');
  });
});
