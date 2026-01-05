// spec: Category Management - Change event category
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('Change event category', async ({ page }) => {
    // Navigate to calendar page
    await login(page);

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 1. First create a category to use
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('변경테스트');
    await page.locator('.flex.flex-wrap > button').first().click();
    await page.getByRole('button', { name: '추가' }).click();

    await expect(page.getByText('변경테스트').first()).toBeVisible();
    await page.keyboard.press('Escape');

    // 2. Create an event with the category
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByRole('textbox', { name: '제목' }).fill('카테고리 변경 테스트');

    // Select category from dropdown
    await page.getByRole('combobox').filter({ hasText: '없음' }).click();
    await page.getByRole('option', { name: '변경테스트' }).first().click();

    // 3. Verify the category was selected
    await expect(page.getByRole('combobox').filter({ hasText: '변경테스트' })).toBeVisible();
  });
});
