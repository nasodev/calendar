// spec: UI/UX - Page Load Performance Test
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Performance - page load time', async ({ page }) => {
    // Record start time
    const startTime = Date.now();

    // Navigate to the application
    await login(page);

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible({ timeout: 3000 });

    // Calculate total time
    const endTime = Date.now();
    const totalLoadTime = endTime - startTime;

    // Verify page loads within acceptable time (<10 seconds including auth)
    expect(totalLoadTime).toBeLessThan(10000);

    // Verify all navigation buttons are visible
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일', exact: true })).toBeVisible();

    // Verify loading indicators are not present
    await expect(page.locator('[role="progressbar"]')).toHaveCount(0);
  });
});
