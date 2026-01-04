// spec: UI/UX Test Suite - Responsive design - tablet view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Responsive design - tablet view', async ({ page }) => {
    // 1. Set browser viewport to tablet size (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });

    // 2. Navigate to calendar and verify layout adjusts
    await login(page);

    // Verify all navigation buttons are visible and accessible
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일' })).toBeVisible();

    // 3. Check that touch targets are adequately sized - open event dialog
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 4. Verify dialogs adapt to smaller width
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '제목' })).toBeVisible();
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();

    // Close the event dialog
    await page.getByRole('button', { name: 'Close' }).click();

    // Test category management dialog responsiveness
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // Verify category dialog adapts to tablet width
    await expect(page.getByRole('dialog', { name: '카테고리 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '카테고리 추가' })).toBeVisible();
    await expect(page.getByText('가족')).toBeVisible();
  });
});
