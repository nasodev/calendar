// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Recurring', () => {
  test('Create weekly recurring event with default weekday', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002/login');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title '주간 회의'
    await page.getByRole('textbox', { name: '제목' }).fill('주간 회의');

    // 4. Enable recurrence option
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();

    // 5. Select 'Weekly' (매주) frequency
    await page.getByRole('option', { name: '매주' }).click();

    // 6. Keep default weekday (same as event date)
    // Note: Default weekday is Saturday (토) based on start date January 4, 2026
    // No weekday buttons need to be clicked to use the default

    // 7. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 8. Verify the event appears on the same weekday in subsequent weeks
    // Verify event appears on January 11 (next Saturday)
    await expect(page.getByText('주간 회의').nth(0)).toBeVisible();
    
    // Verify event appears on January 18 (Saturday)
    await expect(page.getByText('주간 회의').nth(1)).toBeVisible();
    
    // Verify event appears on January 25 (Saturday)
    await expect(page.getByText('주간 회의').nth(2)).toBeVisible();

    // Navigate to next month to verify continuation
    await page.getByRole('button').nth(1).click();

    // Verify event appears on February 1 (Saturday)
    await expect(page.getByText('주간 회의').first()).toBeVisible();
    
    // Verify event appears on February 8 (Saturday)
    await expect(page.getByText('주간 회의').nth(1)).toBeVisible();
  });
});
