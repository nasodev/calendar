// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Recurring', () => {
  test('Delete recurring event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. First create a recurring event to delete
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByRole('textbox', { name: '제목' }).fill('삭제할 반복일정');

    // Enable daily recurrence
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();
    await page.getByRole('option', { name: '매일' }).click();

    // Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // Verify dialog closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
