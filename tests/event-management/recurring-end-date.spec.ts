// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Recurring', () => {
  test('Set recurrence end date', async ({ page }) => {
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('프로젝트 미팅');

    // 4. Enable recurrence option
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();

    // 5. Select 'Daily' (매일) frequency
    await page.getByRole('option', { name: '매일' }).click();

    // 6. Verify recurrence end date button appears
    await expect(page.getByRole('button', { name: '종료일 선택 (선택사항)' })).toBeVisible();

    // 7. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 8. Verify dialog closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
