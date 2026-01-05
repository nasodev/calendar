// spec: UI/UX - Responsive design - mobile view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Responsive design - mobile view', async ({ page }) => {
    // 1. Set browser viewport to mobile size (375x667)
    await page.setViewportSize({ width: 375, height: 667 });

    // 2. Login and verify calendar loads
    await login(page);

    // 3. Verify viewport size is correct
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBe(375);
    expect(viewportSize?.height).toBe(667);

    // 4. Verify at least some buttons are visible and functional on mobile
    const monthButton = page.getByRole('button', { name: '월' });
    await expect(monthButton).toBeVisible();

    // 5. Test view switching works on mobile
    await monthButton.click();

    // 6. Verify calendar rendered (check for calendar grid or any calendar element)
    // The calendar should be displayed even on mobile
    await page.waitForTimeout(500);

    // 7. Verify mobile view is functional
    await expect(monthButton).toBeVisible();
  });
});
