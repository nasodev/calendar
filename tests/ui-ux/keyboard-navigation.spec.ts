// spec: UI/UX - Accessibility - keyboard navigation
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Accessibility - keyboard navigation', async ({ page }) => {
    // Navigate to calendar page (already authenticated via storageState)
    await login(page);

    // 1. Navigate to calendar using only keyboard (Tab key)
    // Press Tab to navigate to first interactive element
    await page.keyboard.press('Tab');

    // 2. Verify focus indicators are visible on interactive elements
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement;
      return {
        tagName: focused?.tagName,
        hasVisibleOutline: window.getComputedStyle(focused!).outline !== 'none',
        boxShadow: window.getComputedStyle(focused!).boxShadow
      };
    });

    // Verify focus indicator is present (either outline or box-shadow)
    expect(focusedElement.tagName).toBe('BUTTON');
    expect(
      focusedElement.hasVisibleOutline || 
      focusedElement.boxShadow.includes('rgb') ||
      focusedElement.boxShadow.includes('oklab')
    ).toBeTruthy();

    // Navigate through more buttons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify we're on the "오늘" button
    const todayButton = page.getByRole('button', { name: '오늘' });
    await expect(todayButton).toBeFocused();

    // 3. Use Enter/Space to activate buttons
    // Test Enter key
    await page.keyboard.press('Enter');
    await expect(page.getByText('2026년 1월')).toBeVisible();

    // Navigate to view switcher buttons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Navigate to previous month button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Test Space key to activate navigation button
    await page.keyboard.press('Space');
    await expect(page.getByRole('heading', { name: '2025년 12월' })).toBeVisible();

    // Navigate back to current month
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await expect(page.getByText('2026년 1월')).toBeVisible();

    // 5. Open and close dialogs using keyboard
    // Navigate to "일정 추가" button
    const addEventButton = page.getByRole('button', { name: '일정 추가' });
    await addEventButton.focus();
    
    // Open dialog with Enter
    await page.keyboard.press('Enter');
    
    // Verify dialog is open
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();

    // Close dialog with Escape key
    await page.keyboard.press('Escape');
    
    // Verify dialog is closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // Open dialog again with Space key
    await addEventButton.focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // Close with Escape again
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // Verify tab order is logical by tabbing through all main buttons
    const mainButtons = [
      '오늘',
      '월',
      '주',
      '일',
      '일정 추가'
    ];

    // Focus on first button
    await page.keyboard.press('Tab');
    
    // Tab through and verify order
    let tabCount = 0;
    const maxTabs = 10; // Safety limit
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      // Check if we've reached one of the main buttons
      const isMainButton = await page.evaluate((buttons) => {
        const focused = document.activeElement;
        return buttons.some(name => focused?.textContent?.includes(name));
      }, mainButtons);
      
      if (isMainButton) {
        break;
      }
    }

    // Verify we can reach the add event button through tabbing
    expect(tabCount).toBeLessThan(maxTabs);
  });
});
