// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Basic', () => {
  test('Cancel event creation', async ({ page }) => {
    // Navigate to the calendar application
    await page.goto('http://localhost:23002');

    // 1. Login - Enter name
    await page.getByRole('textbox', { name: '이름' }).fill('환규');

    // 1. Login - Enter password
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');

    // 1. Login - Click login button
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter some event details (title)
    await page.getByRole('textbox', { name: '제목' }).fill('테스트 취소 일정');

    // 3. Enter some event details (description)
    await page.getByRole('textbox', { name: '설명' }).fill('이 일정은 저장되지 않아야 합니다');

    // 4. Click the cancel button
    await page.getByRole('button', { name: '취소' }).click();

    // 5. Verify the dialog closes - the event title should not be visible
    await expect(page.getByText('테스트 취소 일정')).not.toBeVisible();

    // 6. Verify no new event was created on the calendar - only original events should be present
    await expect(page.getByText('테스트 일정')).toBeVisible();
    await expect(page.getByText('월례 보고')).toBeVisible();
    await expect(page.getByText('기념일')).toBeVisible();
  });
});
