// spec: Category Management - Category name validation
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {
  test('Category name validation', async ({ page }) => {
    // Navigate to calendar home page (already authenticated via storageState)
    await page.goto('/');

    // Open category management dialog
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // Click to create new category
    await page.getByRole('button', { name: '카테고리 추가' }).click();

    // Verify add button is disabled when name field is empty
    await expect(page.getByRole('button', { name: '추가' })).toBeVisible();
    await expect(page.getByRole('button', { name: '추가' })).toBeDisabled();

    // Enter a very long name (>50 characters) to test handling
    const longName = '이것은 매우 긴 카테고리 이름입니다 아주 아주 긴 이름으로 50자가 넘는 텍스트를 입력해보겠습니다';
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill(longName);

    // Verify the long text was accepted without truncation
    await expect(page.getByRole('textbox', { name: '예: 학교, 운동, 가족' })).toHaveValue(longName);
    
    // Verify add button is now enabled with valid input
    await expect(page.getByRole('button', { name: '추가' })).toBeEnabled();

    // Test special characters in category name
    const specialChars = '테스트!@#$%^&*()_+-=[]{}|;:,.<>?';
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill(specialChars);

    // Verify special characters are accepted
    await expect(page.getByRole('textbox', { name: '예: 학교, 운동, 가족' })).toHaveValue(specialChars);
    
    // Verify add button is still enabled with special characters
    await expect(page.getByRole('button', { name: '추가' })).toBeEnabled();

    // Clear the category name field
    await page.getByRole('textbox', { name: '예: 학교, 운동, 가족' }).fill('');

    // Verify add button becomes disabled again when field is empty
    await expect(page.getByRole('button', { name: '추가' })).toBeDisabled();
  });
});
