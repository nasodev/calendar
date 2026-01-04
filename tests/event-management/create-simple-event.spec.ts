// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Basic', () => {
  test('Create simple event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002/login');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('테스트 일정');

    // 4-5. Start date and time are already set by default (2026년 1월 4일, 09:00-10:00)

    // 6. Click the save/confirm button
    await page.getByRole('button', { name: '저장' }).click();

    // 7. Verify the event appears on the calendar
    await expect(page.getByText('테스트 일정')).toBeVisible();
  });
});
