// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Basic', () => {
  test('Edit existing event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click on an existing event in the calendar (e.g., '카테고리 테스트')
    await page.getByRole('paragraph').filter({ hasText: '카테고리 테스트' }).click();

    // 3. Verify event detail/edit dialog opens
    await expect(page.getByRole('dialog', { name: '일정 수정' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue('카테고리 테스트');

    // 4. Modify the event title (e.g., change to '수정된 일정')
    await page.getByRole('textbox', { name: '제목' }).fill('수정된 일정');

    // 5. Click save button
    await page.getByRole('button', { name: '저장' }).click();

    // 6. Verify the updated event title appears on calendar
    await expect(page.getByText('수정된 일정')).toBeVisible();
  });
});
