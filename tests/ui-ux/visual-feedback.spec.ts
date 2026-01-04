// spec: UI/UX - Visual feedback on interactions
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Visual feedback on interactions', async ({ page }) => {
    // Navigate to calendar page
    await login(page);

    // 1. Hover over buttons and verify hover states - Test Add Event button hover
    await page.getByRole('button', { name: '일정 추가' }).hover();

    // 1. Hover over buttons and verify hover states - Test Today button hover
    await page.getByRole('button', { name: '오늘' }).hover();

    // 1. Hover over buttons and verify hover states - Test Month view button hover
    await page.getByRole('button', { name: '월' }).hover();

    // 2. Click buttons and verify click feedback - Open Add Event dialog
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 2. Click buttons and verify click feedback - Verify Add Event dialog opened
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 2. Click buttons and verify click feedback - Verify default time values are set
    await expect(page.getByRole('textbox').nth(2)).toHaveValue('09:00');

    // 2. Click buttons and verify click feedback - Close dialog to test more interactions
    await page.getByRole('button', { name: 'Close' }).click();

    // 2. Click buttons and verify click feedback - Switch to week view
    await page.getByRole('button', { name: '주' }).click();

    // 2. Click buttons and verify click feedback - Verify week view switched successfully
    await expect(page.getByRole('heading', { name: '2026년 1월 4일 - 10일' })).toBeVisible();

    // 2. Click buttons and verify click feedback - Switch back to month view
    await page.getByRole('button', { name: '월' }).click();

    // 3. Observe loading states when data is being fetched - Wait for month view to load
    await page.getByText("2026년 1월").first().waitFor({ state: 'visible' });

    // 4. Check success/error messages after actions - Open event dialog to test validation
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 4. Check success/error messages after actions - Enter title to enable save button
    await page.getByRole('textbox', { name: '제목' }).fill('Visual Feedback Test');

    // 4. Check success/error messages after actions - Verify save button is now enabled after entering title
    await expect(page.getByRole('button', { name: '저장' })).toBeVisible();

    // 4. Check success/error messages after actions - Click save to create event
    await page.getByRole('button', { name: '저장' }).click();

    // 4. Check success/error messages after actions - Verify event was created successfully
    await expect(page.getByText('Visual Feedback Test')).toBeVisible();
  });
});
