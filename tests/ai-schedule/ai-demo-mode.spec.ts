// spec: AI Schedule - Demo mode (logged out users)
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AI Schedule - Demo Mode', () => {
  test('should not show AI button for demo users', async ({ page }) => {
    // Navigate directly without logging in (demo mode)
    await page.goto('/');

    // Wait for calendar to load in demo mode
    await page.waitForSelector('[data-testid="calendar-header"]', { timeout: 10000 });

    // AI button should NOT be visible in demo mode
    const aiButton = page.getByRole('button', { name: /AI 등록/ });
    await expect(aiButton).toHaveCount(0);

    // But regular add event button should be visible (icon-only on mobile, text on desktop)
    // Check that the "일정 추가" button exists on desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });

  test('should show demo mode banner', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="calendar-header"]', { timeout: 10000 });

    // Demo mode banner should be visible
    await expect(page.getByText('데모 모드')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });
});
