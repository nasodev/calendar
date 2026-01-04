// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Basic', () => {
  test('Delete event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Click on an existing event in the calendar
    await page.getByText('수정된 일정오후 03:00환규').nth(1).click();

    // 3. Click the delete button in the event dialog
    await page.getByRole('button', { name: '삭제' }).click();

    // 4. Verify the event is removed from the calendar
    await expect(page.getByText('수정된 일정')).not.toBeVisible();
  });
});
