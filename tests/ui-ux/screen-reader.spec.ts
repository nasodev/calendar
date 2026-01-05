// spec: UI/UX - Accessibility - Screen Reader Support
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Accessibility - screen reader support', async ({ page }) => {
    // Navigate to the calendar page
    await login(page);

    // 1. Verify main action button has accessible name
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Verify navigation button has accessible name
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();

    // 3. Verify view switcher buttons have accessible names
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일', exact: true })).toBeVisible();

    // 4. Verify heading is properly labeled
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();

    // 5. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 6. Verify dialog has proper role
    const dialog = page.getByRole('dialog', { name: '일정 추가' });
    await expect(dialog).toBeVisible();

    // 7. Verify form fields are accessible
    await expect(dialog.getByRole('textbox', { name: '제목' })).toBeVisible();

    // 8. Verify dialog action buttons have accessible names
    await expect(dialog.getByRole('button', { name: '취소' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: '저장' })).toBeVisible();

    // 9. Close dialog
    await dialog.getByRole('button', { name: '취소' }).click();
    await expect(dialog).not.toBeVisible();
  });
});
