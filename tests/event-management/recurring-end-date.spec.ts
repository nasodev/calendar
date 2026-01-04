// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Recurring', () => {
  test('Set recurrence end date', async ({ page }) => {
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title (e.g., '프로젝트 미팅')
    await page.getByRole('textbox', { name: '제목' }).fill('프로젝트 미팅');

    // 4. Enable recurrence option
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();

    // 5. Select 'Daily' (매일) frequency
    await page.getByRole('option', { name: '매일' }).click();

    // 6. Set a recurrence end date (e.g., January 15)
    await page.getByRole('button', { name: '종료일 선택 (선택사항)' }).click();
    await page.getByRole('button', { name: 'Thursday, January 15th,' }).click();
    await page.keyboard.press('Escape');

    // 7. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 8. Verify event appears until the end date but not after
    await expect(page.getByText('프로젝트 미팅')).toBeVisible();
  });
});
