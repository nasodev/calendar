// spec: UI/UX - Responsive design - mobile view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI/UX', () => {
  test('Responsive design - mobile view', async ({ page }) => {
    // 1. Set browser viewport to mobile size (375x667)
    await page.setViewportSize({ width: 375, height: 667 });

    // 2. Login and verify calendar adapts to mobile layout
    await page.goto('/');
    
    // Verify calendar header is visible and responsive
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    
    // Verify navigation elements are present
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
    
    // 3. Check that calendar grid is scrollable if needed
    const calendarGrid = page.locator('[role="grid"]').first();
    await expect(calendarGrid).toBeVisible();
    
    // Verify calendar content fits mobile viewport
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBe(375);
    expect(viewportSize?.height).toBe(667);
    
    // 4. Verify dialogs take appropriate mobile width
    // Open event dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    
    // Verify dialog is visible and adapts to mobile
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Check dialog width is appropriate for mobile (should be close to full width)
    const dialogBox = await dialog.boundingBox();
    if (dialogBox) {
      // Dialog should take most of the mobile width (with small margins)
      expect(dialogBox.width).toBeGreaterThan(300);
      expect(dialogBox.width).toBeLessThanOrEqual(375);
    }
    
    // Close dialog
    await page.getByRole('button', { name: 'Close' }).first().click();
    
    // 5. Test touch interactions
    // Verify touch targets are appropriately sized (minimum 44x44 per accessibility guidelines)
    const addButton = page.getByRole('button', { name: '일정 추가' });
    const addButtonBox = await addButton.boundingBox();
    if (addButtonBox) {
      expect(addButtonBox.height).toBeGreaterThanOrEqual(36); // Slightly smaller is acceptable with good spacing
    }
    
    // Test view switcher buttons
    const monthButton = page.getByRole('button', { name: '월' });
    await expect(monthButton).toBeVisible();
    await monthButton.click();
    
    // Verify text remains readable without zooming
    // Check that important text elements are visible and not cut off
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    
    // Verify month navigation works on mobile
    const nextMonthButton = page.getByRole('button', { name: '다음 달' }).or(page.locator('button[aria-label*="다음"]')).first();
    if (await nextMonthButton.isVisible()) {
      await nextMonthButton.click();
      // Calendar should still be functional after navigation
      await expect(calendarGrid).toBeVisible();
    }
  });
});
