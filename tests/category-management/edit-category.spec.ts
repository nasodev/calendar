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

    // 1. Open category management dialog
    await page.getByRole('button', { name: '카테고리' }).click();

    // Wait for category dialog
    await expect(page.getByRole('heading', { name: '카테고리 관리' })).toBeVisible();

    // 2. Create a test category first
    await page.getByRole('button', { name: '새 카테고리' }).click();
    await page.getByLabel('카테고리 이름').fill('수정 테스트');
    await page.locator('button[role="radio"]').first().click();
    await page.getByRole('button', { name: '저장' }).click();

    // Wait for category to be saved
    await expect(page.getByText('수정 테스트')).toBeVisible();

    // 3. Look for edit option in category list - click on the category or edit icon
    // The category list shows categories with edit buttons
    const categoryItem = page.locator('div').filter({ hasText: '수정 테스트' }).first();

    // Click edit button (pencil icon) if available, or click the category name
    const editButton = categoryItem.getByRole('button').first();
    await editButton.click();

    // 4. Modify category name
    await page.getByLabel('카테고리 이름').fill('수정 완료');

    // 5. Change color
    await page.locator('button[role="radio"]').nth(2).click();

    // 6. Save changes
    await page.getByRole('button', { name: '저장' }).click();

    // 7. Verify updated category appears in list
    await expect(page.getByText('수정 완료')).toBeVisible();

    // Verify old name is gone
    await expect(page.getByText('수정 테스트')).not.toBeVisible();

    // 8. Close category dialog
    await page.getByRole('button', { name: 'Close' }).click();

    // 9. Verify updated category appears in event category dropdown
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Open category dropdown
    await page.getByRole('combobox', { name: '카테고리' }).click();

    // Verify updated category appears in dropdown
    await expect(page.getByRole('option', { name: '수정 완료' })).toBeVisible();
  });
});
