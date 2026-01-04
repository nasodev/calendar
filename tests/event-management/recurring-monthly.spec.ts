// spec: Event Management - Recurring - Create monthly recurring event
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Recurring', () => {
  test('Create monthly recurring event', async ({ page }) => {
    // Navigate to the calendar application and login
    await login(page);
    
    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();
    
    // 3. Enter event title '월례 회의'
    await page.getByRole('textbox', { name: '제목' }).fill('월례 회의');
    
    // 4. Enable recurrence option - Click the recurrence combobox to open options
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();
    
    // 5. Select 'Monthly' (매월) frequency
    await page.getByRole('option', { name: '매월' }).click();
    
    // 6. Save the event
    await page.getByRole('button', { name: '저장' }).click();
    
    // 7. Navigate to next month
    await page.getByRole('button').nth(1).click();
    
    // 8. Verify the event appears on the same date next month
    // Check that we're viewing February 2026
    await expect(page.getByRole('heading', { name: '2026년 2월' })).toBeVisible();
    
    // Verify the monthly recurring event '월례 회의' appears on February 4th
    // Note: Currently this test will fail as the monthly recurrence is not working correctly
    // The event should appear on the same date (4th) in February, but it does not
    const eventTitle = page.getByText('월례 회의').first();
    await expect(eventTitle).toBeVisible();
  });
});
