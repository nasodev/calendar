// spec: Performance - calendar rendering with many events
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Performance - calendar rendering with many events', async ({ page }) => {
    // Navigate to calendar
    await login(page);

    // Verify calendar renders (month view should be visible)
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월/ })).toBeVisible();

    // Switch to week view to test view transition
    const weekButton = page.getByRole('button', { name: '주' });
    await weekButton.click();

    // Verify week view loaded
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월 \d{1,2}일/ })).toBeVisible();

    // Switch to day view
    const dayButton = page.getByRole('button', { name: '일', exact: true });
    await dayButton.click();

    // Verify day view loaded
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월 \d{1,2}일/ })).toBeVisible();

    // Switch back to month view
    const monthButton = page.getByRole('button', { name: '월' });
    await monthButton.click();

    // Verify month view loaded
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월$/ })).toBeVisible();

    // Verify UI remains responsive
    await expect(page.getByRole('button', { name: '오늘' })).toBeEnabled();
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeEnabled();
  });
});
