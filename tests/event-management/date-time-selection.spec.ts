// spec: Test Suite: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Basic', () => {
  test('Date and time selection', async ({ page }) => {
    // Navigate to the calendar application home page
    await login(page);
    
    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();
    
    // 3. Click on the start date field and select a different date
    await page.getByRole('button', { name: '년 1월 4일' }).first().click();
    
    // 3. Click on the start date field and select a different date - Select January 15th
    await page.getByRole('button', { name: 'Thursday, January 15th,' }).click();
    
    // Close the date picker dialog
    await page.keyboard.press('Escape');
    
    // 4. Click on the start time field and select a time - Enter 14:30
    await page.getByRole('textbox').nth(2).click();
    await page.getByRole('textbox').nth(2).fill('14:30');
    
    // 5. Click on the end date field and select a date
    await page.getByRole('button', { name: '년 1월 4일' }).click();
    
    // 5. Click on the end date field and select a date - Select January 20th
    await page.getByRole('button', { name: 'Tuesday, January 20th,' }).click();
    
    // Close the end date picker dialog
    await page.keyboard.press('Escape');
    
    // 6. Click on the end time field and select a time - Enter 18:45
    await page.getByRole('textbox').nth(3).click();
    await page.getByRole('textbox').nth(3).fill('18:45');
    
    // 7. Verify the selected dates and times are displayed correctly - Verify start date
    await expect(page.getByText('2026년 1월 15일')).toBeVisible();
    
    // 7. Verify the selected dates and times are displayed correctly - Verify start time
    await expect(page.getByRole('textbox').nth(2)).toHaveValue('14:30');
    
    // 7. Verify the selected dates and times are displayed correctly - Verify end date
    await expect(page.getByText('2026년 1월 20일')).toBeVisible();
    
    // 7. Verify the selected dates and times are displayed correctly - Verify end time
    await expect(page.getByRole('textbox').nth(3)).toHaveValue('18:45');
  });
});
