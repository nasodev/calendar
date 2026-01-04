// spec: Category Management - Open category management dialog
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {
  test('Open category management dialog', async ({ page }) => {
    // 1. Navigate to the calendar application
    await page.goto('http://localhost:23002');

    // 2. Enter username 환규
    await page.getByRole('textbox', { name: '이름' }).fill('환규');

    // 3. Enter password hwankyu
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');

    // 4. Click login button
    await page.getByRole('button', { name: '로그인' }).click();

    // 5. Find and click the category management button (카테고리 관리)
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // 6. Verify the category management dialog opens
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // 7. Verify message that no categories are registered is displayed
    await expect(page.getByText('등록된 카테고리가 없습니다')).toBeVisible();

    // 8. Verify the category add button is visible in the dialog
    await expect(page.getByRole('button', { name: '카테고리 추가' })).toBeVisible();
  });
});
