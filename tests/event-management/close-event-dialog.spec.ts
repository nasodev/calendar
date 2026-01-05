// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Basic', () => {
  test('Close event dialog using X button', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Verify dialog is visible
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Click the X button (close button) on the dialog
    await page.getByRole('button', { name: 'Close' }).click();

    // 4. Verify the dialog closes
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
