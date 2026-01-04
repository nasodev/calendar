// spec: Authentication test suite
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Session persistence', async ({ page }) => {
    // 1. Login successfully
    await page.goto('http://localhost:23002/login');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();
    
    // Verify login successful - calendar page loaded
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Refresh the page
    await page.goto('http://localhost:23002/');
    
    // Wait for calendar to load after refresh
    await page.getByText("일정 추가").first().waitFor({ state: 'visible' });
    
    // Verify user remains logged in after page refresh
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    
    // Verify calendar data loads immediately
    await expect(page.getByText('카테고리 테스트')).toBeVisible();
  });
});
