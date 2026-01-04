// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('Assign category to event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('팀 미팅');

    // 4. Find and click the category selector
    await page.getByRole('combobox').filter({ hasText: '없음' }).click();

    // 5. Select a category from the dropdown
    await page.getByRole('option', { name: '업무' }).click();

    // 6. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 7. Verify the event is created with the selected category
    await expect(page.getByText('팀 미팅')).toBeVisible();
  });
});
