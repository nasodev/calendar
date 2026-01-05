// spec: UI/UX Test Suite - Responsive design - tablet view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Responsive design - tablet view', async ({ page }) => {
    // 1. Set browser viewport to tablet size (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });

    // 2. Navigate to calendar
    await login(page);

    // Verify all navigation buttons are visible
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일', exact: true })).toBeVisible();

    // 3. Open event dialog
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 4. Verify dialog works on tablet
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '제목' })).toBeVisible();
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
    await expect(page.getByRole('button', { name: '저장' })).toBeVisible();

    // Close the event dialog
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
