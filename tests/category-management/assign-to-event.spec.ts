// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('Assign category to event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. First create a category to use
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('업무');
    await page.locator('.flex.flex-wrap > button').first().click();
    await page.getByRole('button', { name: '추가' }).click();

    await expect(page.getByText('업무').first()).toBeVisible();
    await page.keyboard.press('Escape');

    // 3. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 4. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('팀 미팅');

    // 5. Find and click the category selector
    await page.getByRole('combobox').filter({ hasText: '없음' }).click();

    // 6. Select a category from the dropdown (use first matching option)
    await page.getByRole('option', { name: '업무' }).first().click();

    // 7. Verify the category was selected (combobox shows category name)
    await expect(page.getByRole('combobox').filter({ hasText: '업무' })).toBeVisible();
  });
});
