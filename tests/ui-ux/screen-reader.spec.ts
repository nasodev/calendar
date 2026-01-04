// spec: UI/UX - Accessibility - Screen Reader Support
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Accessibility - screen reader support', async ({ page }) => {
    // Navigate to the calendar page (already authenticated via storageState)
    await login(page);

    // 1. Verify main action button has accessible name
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Verify navigation button 'Today' has accessible name
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();

    // 3. Verify view switcher buttons have accessible names
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일' })).toBeVisible();

    // 4. Verify heading for current month is properly labeled with semantic HTML
    await expect(page.getByRole('heading', { level: 2 })).toContainText('2026');

    // 5. Open event creation dialog to check form accessibility
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 6. Verify dialog has proper role and is visible
    const dialog = page.getByRole('dialog', { name: '일정 추가' });
    await expect(dialog).toBeVisible();

    // 7. Verify dialog has proper heading
    await expect(dialog.getByRole('heading', { name: '일정 추가', level: 2 })).toBeVisible();

    // 8. Verify form fields are accessible (even without explicit labels, they should be findable by role)
    // The textboxes should be accessible to screen readers via their accessible names
    const titleInput = dialog.getByRole('textbox', { name: '제목' });
    const descInput = dialog.getByRole('textbox', { name: '설명' });
    
    await expect(titleInput).toBeVisible();
    await expect(descInput).toBeVisible();

    // 9. Verify checkbox has accessible label
    await expect(dialog.getByRole('checkbox', { name: '종일' })).toBeVisible();

    // 10. Verify combobox elements are accessible
    await expect(dialog.getByRole('combobox').first()).toBeVisible();

    // 11. Verify dialog action buttons have accessible names
    await expect(dialog.getByRole('button', { name: '취소' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: '저장' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible();

    // 12. Close dialog
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();

    // 13. Verify event cards display accessible information
    // Event cards should have readable text content for screen readers
    const eventCard = page.locator('text=프로젝트 미팅').first();
    await expect(eventCard).toBeVisible();

    // 14. Verify time information is accessible
    await expect(page.locator('text=오후 03:00').first()).toBeVisible();

    // 15. Verify member information is accessible
    await expect(page.locator('text=환규').first()).toBeVisible();
  });
});
