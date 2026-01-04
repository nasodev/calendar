// spec: Edge Cases
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('Create event with emoji', async ({ page }) => {
    // 1. Navigate to calendar page (already authenticated via storageState)
    await page.goto('/');

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Open event creation dialog by clicking "일정 추가" button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Wait for dialog to open
    await expect(page.getByRole('textbox', { name: '제목' })).toBeVisible();

    // 3. Enter title with emoji like "🎉 파티 🎂"
    await page.getByRole('textbox', { name: '제목' }).fill('🎉 파티 🎂');

    // 4. Fill in date/time (using default values)
    // Start date and time are already set by default

    // 5. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // Wait for dialog to close
    await expect(page.getByRole('textbox', { name: '제목' })).not.toBeVisible();

    // 6. Verify the event displays with emoji correctly
    await expect(page.getByText('🎉 파티 🎂')).toBeVisible();

    // 7. Verify emoji is rendered correctly without encoding issues
    const eventElement = page.getByText('🎉 파티 🎂').first();
    await expect(eventElement).toBeVisible();
    
    // Verify the text content matches exactly (emojis should not be encoded)
    const textContent = await eventElement.textContent();
    expect(textContent).toContain('🎉');
    expect(textContent).toContain('파티');
    expect(textContent).toContain('🎂');
  });
});
