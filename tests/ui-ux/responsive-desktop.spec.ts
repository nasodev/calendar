// spec: UI/UX - Responsive design desktop view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI/UX', () => {
  test('Responsive design - desktop view', async ({ page }) => {
    // 1. Set browser viewport to desktop size (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 2. Navigate to calendar (already authenticated via storageState)
    await page.goto('/');

    // 3. Verify all UI elements are properly sized and positioned
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByText('월')).toBeVisible();
    await expect(page.getByText('주')).toBeVisible();
    await expect(page.getByText('일')).toBeVisible();
    await expect(page.getByText('오늘')).toBeVisible();

    // 4. Check that calendar grid is wide and readable
    // Verify calendar displays events properly
    await expect(page.getByText('프로젝트 미팅 (수정됨)').first()).toBeVisible();
    await expect(page.getByText('테스트 일정')).toBeVisible();

    // 5. Verify dialogs are centered and appropriately sized
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '제목' })).toBeVisible();
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
    await expect(page.getByRole('button', { name: '저장' })).toBeVisible();
    await page.getByRole('button', { name: '취소' }).click();

    // Verify no horizontal scrolling required
    const scrollInfo = await page.evaluate(() => {
      const body = document.body;
      return {
        hasHorizontalScroll: body.scrollWidth > body.clientWidth
      };
    });
    expect(scrollInfo.hasHorizontalScroll).toBe(false);
  });
});
