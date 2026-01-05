// spec: Korean Localization Test
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Korean localization', async ({ page }) => {
    // Navigate to the calendar application
    await login(page);

    // Verify calendar header Korean labels
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일', exact: true })).toBeVisible();

    // Check date formatting uses Korean format
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월$/ })).toBeVisible();

    // Click "일정 추가" button to open event dialog
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Verify event dialog Korean labels
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    const dialog = page.getByRole('dialog', { name: '일정 추가' });

    // Verify Korean labels in the event form
    await expect(dialog.getByText('제목')).toBeVisible();
    await expect(dialog.getByText('시작일')).toBeVisible();
    await expect(dialog.getByText('종료일')).toBeVisible();

    // Verify action buttons are in Korean
    await expect(dialog.getByRole('button', { name: '저장' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: '취소' })).toBeVisible();

    // Close dialog
    await page.getByRole('button', { name: '취소' }).click();
    await expect(dialog).not.toBeVisible();
  });
});
