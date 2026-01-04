// spec: Authentication - Auto-registration on first login
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Auto-registration on first login', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:23002/login');

    // Enter name in the name field
    await page.getByRole('textbox', { name: '이름' }).fill('환규');

    // Enter password in the password field
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');

    // Click the login button to submit credentials
    await page.getByRole('button', { name: '로그인' }).click();

    // Verify that the 'Add Event' button is visible, confirming calendar features are accessible
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // Verify that the calendar header showing current month is visible
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();

    // Verify that events are visible on the calendar, confirming full calendar functionality
    await expect(page.getByText('카테고리 테스트')).toBeVisible();
  });
});
