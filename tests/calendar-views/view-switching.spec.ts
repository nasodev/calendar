// spec: Calendar Views - Switch between calendar views
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Calendar Views', () => {
  test('Switch between calendar views', async ({ page }) => {
    // 1. Login and navigate to calendar (starts in month view)
    await login(page);
    
    // Verify month view is displayed by default
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toHaveAttribute('data-state', 'active');
    
    // 2. Click '주' (Week) button and verify week view is displayed
    await page.getByRole('button', { name: '주' }).click();
    await expect(page.getByRole('heading', { name: /2026년 1월 \d+일 - \d+일/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toHaveAttribute('data-state', 'active');
    
    // 3. Click '일' (Day) button and verify day view is displayed
    await page.getByRole('button', { name: '일', exact: true }).click();
    await expect(page.getByRole('heading', { name: /2026년 1월 \d+일/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '일', exact: true })).toHaveAttribute('data-state', 'active');
    
    // 4. Click '월' (Month) button and verify month view is displayed
    await page.getByRole('button', { name: '월' }).click();
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toHaveAttribute('data-state', 'active');
    
    // Verify calendar data is preserved across view switches
    await expect(page.getByText('카테고리 테스트')).toBeVisible();
    await expect(page.getByText('월례 보고')).toBeVisible();
    await expect(page.getByText('기념일')).toBeVisible();
  });
});
