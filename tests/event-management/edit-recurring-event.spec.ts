// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Recurring', () => {
  test('Edit recurring event', async ({ page }) => {
    // Navigate to the calendar application
    await page.goto('http://localhost:23002');
    
    // Wait for loading to complete
    await page.getByText("로딩 중...").first().waitFor({ state: 'hidden' });
    
    // 1. Login and navigate to calendar
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();
    
    // 2. Click on an existing recurring event on the calendar
    await page.getByText('프로젝트 미팅').first().click();
    
    // 3. Modify the event title
    await page.getByRole('textbox', { name: '제목' }).fill('프로젝트 미팅 (수정됨)');
    
    // 4. Save the changes
    await page.getByRole('button', { name: '저장' }).click();
    
    // 5. Verify all instances of the recurring event are updated
    await expect(page.getByText('프로젝트 미팅 (수정됨)')).toBeVisible();
  });
});
