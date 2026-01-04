// spec: Edge Cases - Midnight Crossing Events
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('Midnight crossing events', async ({ page }) => {
    // 1. Navigate to calendar (already authenticated via storageState)
    await page.goto('http://localhost:23002/');
    
    // Wait for calendar to load
    await page.getByRole('button', { name: '일정 추가' }).waitFor({ state: 'visible' });
    
    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    
    // 3. Create an event that starts at 23:00 and ends at 01:00 (next day)
    await page.getByRole('textbox', { name: '제목' }).fill('자정 넘는 일정');
    
    // Get the time input fields
    const timeInputs = page.getByRole('textbox').filter({ hasText: /^\d{2}:\d{2}$/ });
    
    // Set start time to 23:00
    await timeInputs.nth(0).click();
    await timeInputs.nth(0).fill('23:00');
    
    // Change end date to next day (January 5, 2026)
    // Click on the end date button
    const endDateButton = page.getByRole('button', { name: /2026년 1월 \d+일/ }).nth(1);
    await endDateButton.click();
    
    // Wait for date picker to appear and select the next day
    await page.getByText('5').first().click();
    
    // Set end time to 01:00
    await timeInputs.nth(1).click();
    await timeInputs.nth(1).fill('01:00');
    
    // 4. Save the event
    await page.getByRole('button', { name: '저장' }).click();
    
    // 5. Verify the event spans across midnight correctly
    // The event should be visible on the calendar
    await expect(page.getByText('자정 넘는 일정')).toBeVisible();
    
    // Verify no errors occurred (the event was saved successfully)
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
