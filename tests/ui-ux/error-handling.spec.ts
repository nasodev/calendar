// spec: UI/UX - Error handling and user messages
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Error handling and user messages', async ({ page }) => {
    // 1. Navigate to calendar and wait for it to load
    await login(page);
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Set up network interception to simulate backend failure
    await page.route('http://localhost:28000/**', route => route.abort());

    // 3. Attempt to create an event with network error
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByRole('textbox', { name: '제목' }).fill('네트워크 오류 테스트');
    await page.getByRole('button', { name: '저장' }).click();

    // 4. Verify error message is displayed to user in Korean
    // Wait for error toast or alert to appear
    await expect(page.getByText(/오류|실패|에러|문제/)).toBeVisible({ timeout: 5000 });

    // 5. Remove network interception (reconnect backend)
    await page.unroute('http://localhost:28000/**');

    // 6. Retry creating the event
    // If dialog closed, reopen it
    const dialogVisible = await page.getByRole('dialog', { name: '일정 추가' }).isVisible();
    if (!dialogVisible) {
      await page.getByRole('button', { name: '일정 추가' }).click();
      await page.getByRole('textbox', { name: '제목' }).fill('네트워크 복구 테스트');
    }
    await page.getByRole('button', { name: '저장' }).click();

    // 7. Verify success message appears
    // Wait for success toast or confirmation
    await expect(page.getByText(/성공|완료|추가/)).toBeVisible({ timeout: 5000 });
  });
});
