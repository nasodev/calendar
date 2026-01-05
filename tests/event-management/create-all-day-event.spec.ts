// spec: Event Management - Basic / Create all-day event
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Basic', () => {
  test('Create all-day event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Wait for dialog to open
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('하루종일 이벤트');

    // 4. Toggle/check the all-day option (종일)
    const allDayCheckbox = page.getByRole('checkbox', { name: '종일' });
    await allDayCheckbox.click();

    // 5. Verify all-day checkbox is checked
    await expect(allDayCheckbox).toBeChecked();
  });
});
