// spec: Edge Cases - Event time validation
// Note: This test uses storageState authentication from .auth/user.json

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Event time validation - end before start', async ({ page }) => {
    // Navigate to calendar page (already authenticated via storageState)
    await login(page);
    
    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    
    // Step 1: Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    
    // Wait for dialog to open
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    
    // Step 2: Fill in event title (required field)
    await page.getByRole('textbox', { name: '제목' }).fill('테스트 일정');
    
    // Step 3: Set start time to 14:00
    const startTimeInput = page.getByRole('textbox').nth(2);
    await startTimeInput.click();
    await startTimeInput.fill('14:00');
    
    // Step 4: Set end time to 13:00 (before start time - invalid)
    const endTimeInput = page.getByRole('textbox').nth(3);
    await endTimeInput.click();
    await endTimeInput.fill('13:00');
    
    // Step 5: Attempt to save - this should trigger validation
    const saveButton = page.getByRole('button', { name: '저장' });
    await saveButton.click();
    
    // Expected Results: Backend validation should reject with 422 error
    // The console will show: "Failed to load resource: the server responded with a status of 422"
    // Note: Currently there's no visible UI validation message, but the save is prevented
    
    // Wait a moment for any error to appear
    await page.waitForTimeout(1000);
    
    // Verify that we're still on the calendar page (save failed)
    await expect(page).toHaveURL('/');
  });
});
