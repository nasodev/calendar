// spec: UI/UX Test Plan - Calendar theme and styling
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Calendar theme and styling', async ({ page }) => {
    // 1. Navigate to calendar
    await login(page);

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Verify buttons exist and are styled
    const buttonStyles = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent?.includes('일정 추가'));

      const getStyles = (el: Element | null) => {
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          borderRadius: styles.borderRadius,
          fontSize: styles.fontSize,
        };
      };

      return {
        addEventButton: getStyles(addBtn || null),
      };
    });

    // Verify button styling exists
    expect(buttonStyles.addEventButton).toBeTruthy();

    // 3. Verify Tailwind CSS is being used
    const tailwindUsage = await page.evaluate(() => {
      return {
        hasRounded: Array.from(document.querySelectorAll('[class*="rounded"]')).length > 0,
        hasFlex: Array.from(document.querySelectorAll('[class*="flex"]')).length > 0,
        hasBg: Array.from(document.querySelectorAll('[class*="bg-"]')).length > 0
      };
    });

    expect(tailwindUsage.hasRounded).toBe(true);
    expect(tailwindUsage.hasFlex).toBe(true);
    expect(tailwindUsage.hasBg).toBe(true);

    // 4. Check that shadcn/ui components work
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // Verify Radix UI primitives are being used
    const usesRadixUI = await page.evaluate(() => {
      return document.querySelector('[data-state]') !== null;
    });
    expect(usesRadixUI).toBe(true);

    // Close dialog
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
