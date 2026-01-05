// spec: UI/UX - Visual feedback on interactions
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Visual feedback on interactions', async ({ page }) => {
    // Navigate to calendar page
    await login(page);

    // 1. Hover over buttons (verify they exist)
    await page.getByRole('button', { name: '일정 추가' }).hover();
    await page.getByRole('button', { name: '오늘' }).hover();
    await page.getByRole('button', { name: '월' }).hover();

    // 2. Click buttons and verify dialog opens
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Close dialog
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 4. Switch views
    await page.getByRole('button', { name: '주' }).click();
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월 \d{1,2}일/ })).toBeVisible();

    await page.getByRole('button', { name: '월' }).click();
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월$/ })).toBeVisible();

    // 5. Create an event and verify dialog closes
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByRole('textbox', { name: '제목' }).fill('Visual Feedback Test');
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
