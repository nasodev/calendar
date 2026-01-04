// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Basic', () => {
  test('Form validation - empty title', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002/login');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Leave the title field empty (it's already empty by default)
    // Verify the title field is visible and empty
    const titleInput = page.getByRole('textbox', { name: '제목' });
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue('');

    // 4. & 5. Verify save button is disabled when title is empty
    const saveButton = page.getByRole('button', { name: '저장' });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();
  });
});
