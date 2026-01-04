// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Recurring', () => {
  test('Create yearly recurring event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002/login');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title (e.g., '생일')
    await page.getByRole('textbox', { name: '제목' }).fill('생일');

    // 4. Enable recurrence option
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();

    // 5. Select 'Yearly' (매년) frequency
    await page.getByRole('option', { name: '매년' }).click();

    // 6. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 7. Verify the yearly event is created successfully
    // Verify event count increased on January 4, 2026
    await expect(page.getByText('+4 more')).toBeVisible();

    // Navigate to January 2027 to verify yearly recurrence
    const nextButton = page.getByRole('button').nth(1);
    
    // Click next month 12 times to reach January 2027
    for (let i = 0; i < 12; i++) {
      await nextButton.click();
      await page.waitForSelector('h2');
    }

    // Verify we are at January 2027
    await expect(page.getByRole('heading', { name: '2027년 1월' })).toBeVisible();
    
    // Verify the yearly recurring event appears in January 2027
    await expect(page.getByText('+3 more')).toBeVisible();
  });
});
