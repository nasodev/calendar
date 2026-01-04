// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Recurring', () => {
  test('Create daily recurring event', async ({ page }) => {
    // Navigate to the calendar application
    await page.goto('http://localhost:23002');
    
    // Wait for page to fully load
    await new Promise(f => setTimeout(f, 2 * 1000));
    
    // 1. Login and navigate to calendar
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();
    
    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();
    
    // 3. Enter event title (e.g., '매일 운동')
    await page.getByRole('textbox', { name: '제목' }).fill('매일 운동');
    
    // 4. Enable recurrence option - Click recurrence dropdown
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();
    
    // 5. Select 'Daily' (매일) frequency
    await page.getByRole('option', { name: '매일' }).click();
    
    // Verify recurrence field is updated
    await expect(page.getByRole('combobox').filter({ hasText: '매일' })).toBeVisible();
    
    // Verify recurrence end date field appears
    await expect(page.getByRole('button', { name: '종료일 선택 (선택사항)' })).toBeVisible();
    
    // 6. Save the event
    await page.getByRole('button', { name: '저장' }).click();
    
    // 7. Verify the recurring event appears on multiple consecutive days
    // Check that the event appears on at least 5 consecutive days
    await expect(page.getByText('매일 운동').first()).toBeVisible();
    await expect(page.getByText('매일 운동').nth(1)).toBeVisible();
    await expect(page.getByText('매일 운동').nth(2)).toBeVisible();
    await expect(page.getByText('매일 운동').nth(3)).toBeVisible();
    await expect(page.getByText('매일 운동').nth(4)).toBeVisible();
  });
});
