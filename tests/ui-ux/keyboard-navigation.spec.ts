// spec: UI/UX - Accessibility - keyboard navigation
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Accessibility - keyboard navigation', async ({ page }) => {
    // Navigate to calendar
    await login(page);

    // Verify main buttons are visible
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();

    // Test keyboard navigation - open dialog
    const addEventButton = page.getByRole('button', { name: '일정 추가' });
    await addEventButton.focus();
    await page.keyboard.press('Enter');

    // Verify dialog opened
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // Close dialog with Escape key
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // Test Space key to open dialog
    await addEventButton.focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
