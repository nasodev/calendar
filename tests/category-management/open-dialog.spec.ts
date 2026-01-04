// spec: Category Management - Open category management dialog
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('Open category management dialog', async ({ page }) => {
    // 1. Navigate to the calendar application
    await login(page);

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
