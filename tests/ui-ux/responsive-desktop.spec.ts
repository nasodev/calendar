// spec: UI/UX - Responsive design desktop view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Responsive design - desktop view', async ({ page }) => {
    // 1. Set browser viewport to desktop size (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 2. Navigate to calendar
    await login(page);

    // 3. Verify all UI elements are visible
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();

    // 4. Verify dialogs work properly
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

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
