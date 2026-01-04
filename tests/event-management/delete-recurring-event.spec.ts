// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Recurring', () => {
  test('Delete recurring event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // Wait for calendar to load and verify recurring event exists
    await expect(page.getByText('매일 운동오전 12:00환규').first()).toBeVisible();

    // 2. Click on an existing recurring event
    await page.getByText('매일 운동오전 12:00환규').nth(1).click();

    // 3. Click the delete button
    await page.getByRole('button', { name: '삭제' }).click();

    // 4. Confirm deletion if prompted (dialog closes automatically)
    
    // 5. Verify all instances of the recurring event are removed from the calendar
    await expect(page.getByText('매일 운동오전 12:00환규')).not.toBeVisible();
    
    // Verify the calendar is still functional with other events visible
    await expect(page.getByText('헬스장')).toBeVisible();
  });
});
