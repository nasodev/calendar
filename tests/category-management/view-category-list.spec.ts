// spec: Category Management - View all categories in list
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('View all categories in list', async ({ page }) => {
    // 1. Login with credentials (이름: 환규, 비밀번호: hwankyu)
    await login(page);

    // 2. Open category management dialog (gear icon)
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // Wait for category dialog to open
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // 3. Create first category: '스포츠' (unique name to avoid conflicts)
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    // Wait for the input to appear
    const input = page.getByRole('textbox', { name: '예: 학교, 운동, 가족' });
    await expect(input).toBeVisible();
    await input.fill('스포츠');
    // Click the first color button
    await page.getByRole('button').first().click();
    await page.getByRole('button', { name: '추가' }).click();

    // Wait for category to appear
    await expect(page.getByText('스포츠')).toBeVisible();

    // 4. Create second category: '모임'
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await expect(input).toBeVisible();
    await input.fill('모임');
    await page.getByRole('button').first().click();
    await page.getByRole('button', { name: '추가' }).click();

    // Wait for second category to appear
    await expect(page.getByText('모임')).toBeVisible();

    // 5. Verify both categories are visible in the list
    await expect(page.getByText('스포츠')).toBeVisible();
    await expect(page.getByText('모임')).toBeVisible();
  });
});
