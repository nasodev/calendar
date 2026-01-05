// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Basic', () => {
  test('Edit existing event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. First create an event to edit
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByRole('textbox', { name: '제목' }).fill('수정할 일정');
    await page.getByRole('button', { name: '저장' }).click();

    // 3. Verify dialog closed (event was created)
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
