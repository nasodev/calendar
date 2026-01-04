// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {
  test('Create multiple categories', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002');
    await page.getByText("로딩 중...").first().waitFor({ state: 'hidden' });
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Open category management dialog
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // 3. Create first category (e.g., '가족')
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('가족');
    await page.getByRole('button').nth(2).click();
    await page.getByRole('button', { name: '추가' }).click();

    // 4. Create second category (e.g., '개인')
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('개인');
    await page.getByRole('button').nth(5).click();
    await page.getByRole('button', { name: '추가' }).click();

    // 5. Create third category (e.g., '건강')
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('건강');
    await page.locator('.flex.flex-wrap > button:nth-child(3)').click();
    await page.getByRole('button', { name: '추가' }).click();

    // 6. Verify all three categories appear in the list
    await expect(page.getByText('업무')).toBeVisible();
    await expect(page.getByText('가족')).toBeVisible();
    await expect(page.getByText('개인')).toBeVisible();
    await expect(page.getByText('건강')).toBeVisible();
  });
});
