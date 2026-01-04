// spec: Test Suite: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Basic', () => {
  test('Date and time selection', async ({ page }) => {
    // Navigate to the calendar application home page
    await page.goto('http://localhost:23002');
    
    // Wait for the login page to load
    await new Promise(f => setTimeout(f, 2 * 1000));
    
    // 1. Login and navigate to calendar - Enter name
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    
    // 1. Login and navigate to calendar - Enter password
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    
    // 1. Login and navigate to calendar - Click login button
    await page.getByRole('button', { name: '로그인' }).click();
    
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
