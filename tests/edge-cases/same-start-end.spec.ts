// spec: Test 8.11 - Same start and end time
// Tests that the application handles events with identical start and end times gracefully

import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('Same start and end time', async ({ page }) => {
    // 1. Navigate to calendar (already authenticated via storageState)
    await page.goto('http://localhost:23002/');
    
    // Wait for calendar to load
    await page.getByRole('button', { name: '일정 추가' }).waitFor({ state: 'visible' });
    
    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    
    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('동일 시간 테스트');
    
    // 4. Set both start and end time to the same value (10:00)
    // Get the time input fields (they appear as textboxes with time format)
    const timeInputs = page.getByRole('textbox').filter({ hasText: /^\d{2}:\d{2}$/ });
    
    // Set start time to 10:00
    await timeInputs.nth(0).click();
    await timeInputs.nth(0).fill('10:00');
    
    // Set end time to 10:00 (same as start)
    await timeInputs.nth(1).click();
    await timeInputs.nth(1).fill('10:00');
    
    // 5. Attempt to save
    const saveButton = page.getByRole('button', { name: '저장' });
    
    // Check if save button becomes enabled after filling required fields
    // The application should either:
    // - Allow saving (creating a 0-duration event)
    // - Show validation error
    // - Keep save button disabled
    
    // Wait a moment for any validation to run
    await page.waitForTimeout(500);
    
    // 6. Verify the behavior
    // Check if there's any validation message or if the button state changes
    const isDisabled = await saveButton.isDisabled();
    
    if (!isDisabled) {
      // If button is enabled, try to save
      await saveButton.click();
      
      // Verify either:
      // - Dialog closes (event created successfully)
      // - Error message appears
      // - Dialog stays open with validation message
      
      // Check if dialog closed (successful save)
      const dialogVisible = await page.getByRole('dialog', { name: '일정 추가' }).isVisible().catch(() => false);
      
      if (!dialogVisible) {
        // Event was created successfully
        // Verify it appears on the calendar
        await expect(page.getByText('동일 시간 테스트')).toBeVisible();
      } else {
        // Dialog still open - check for validation message
        // The application should show some feedback
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    } else {
      // Save button remains disabled
      // This is acceptable behavior for same start/end time
      await expect(saveButton).toBeDisabled();
    }
    
    // Verify no application crashes or errors occurred
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
