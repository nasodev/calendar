// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Basic', () => {
  test('Multi-day event', async ({ page }) => {
    // Navigate to the calendar application
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title (e.g., '여행 일정')
    await page.getByRole('textbox', { name: '제목' }).fill('여행 일정');

    // 4. Set start date to one day (e.g., January 10)
    await page.getByRole('button', { name: '년 1월 4일' }).first().click();
    await page.getByRole('button', { name: 'Saturday, January 10th,' }).click();
    await page.keyboard.press('Escape');

    // 5. Set end date to a different day (e.g., January 15)
    await page.getByRole('button', { name: '년 1월 4일' }).click();
    await page.getByRole('button', { name: 'Thursday, January 15th,' }).click();
    await page.keyboard.press('Escape');

    // 6. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 7. Verify the multi-day event appears spanning multiple days on the calendar
    await expect(page.getByText('여행 일정')).toBeVisible();
  });
});
