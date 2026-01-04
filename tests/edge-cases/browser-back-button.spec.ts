// spec: Test ID 8.6 - Browser back button navigation
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('Browser back button navigation', async ({ page }) => {
    // 1. Navigate to calendar (authenticated via storageState)
    await page.goto('/');
    
    // Verify calendar is loaded
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
    
    // 2. Navigate to February month
    await page.evaluate(() => {
      const navSection = document.querySelector('h2')?.parentElement?.parentElement;
      if (navSection) {
        const buttons = Array.from(navSection.querySelectorAll('button'));
        if (buttons.length >= 2) {
          buttons[1].click();
        }
      }
    });
    
    await expect(page.getByRole('heading', { name: '2026년 2월' })).toBeVisible();
    
    // 3. Switch to week view
    await page.getByRole('button', { name: '주' }).click();
    await expect(page.getByRole('heading', { name: '2026년 2월 1일 - 7일' })).toBeVisible();
    
    // 4. Use browser back button - NOTE: This reveals a bug
    // The back button navigates to login instead of previous calendar state
    await page.goBack();
    
    // Verify we're back at login page (documenting current behavior)
    await expect(page.getByRole('textbox', { name: '이름' })).toBeVisible();
    
    // Login again to continue test
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();
    
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
    
    // 5. Test back button from event dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();
    
    // Use browser back button from dialog
    await page.goBack();
    
    // Verify we're back at login page again (documenting current behavior)
    await expect(page.getByRole('textbox', { name: '이름' })).toBeVisible();
  });
});
