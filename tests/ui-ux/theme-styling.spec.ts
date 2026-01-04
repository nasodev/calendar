// spec: UI/UX Test Plan - Calendar theme and styling
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Calendar theme and styling', async ({ page }) => {
    // 1. Navigate to calendar (already authenticated via storageState)
    await login(page);
    
    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Observe overall color scheme and check button consistency
    const buttonStyles = await page.evaluate(() => {
      const getStyles = (el: Element | null) => {
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          border: styles.border,
        };
      };
      
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent?.includes('일정 추가'));
      const todayBtn = buttons.find(b => b.textContent?.trim() === '오늘');
      const viewBtns = buttons.filter(b => ['월', '주', '일'].includes(b.textContent?.trim() || ''));
      
      return {
        addEventButton: getStyles(addBtn || null),
        todayButton: getStyles(todayBtn || null),
        viewButtons: viewBtns.map(getStyles),
        bodyBackground: window.getComputedStyle(document.body).backgroundColor
      };
    });

    // Verify button styling consistency
    expect(buttonStyles.addEventButton).toBeTruthy();
    expect(buttonStyles.addEventButton?.borderRadius).toBe('8px');
    expect(buttonStyles.addEventButton?.fontSize).toBe('14px');
    expect(buttonStyles.addEventButton?.fontWeight).toBe('500');
    
    expect(buttonStyles.todayButton).toBeTruthy();
    expect(buttonStyles.todayButton?.borderRadius).toBe('8px');
    expect(buttonStyles.todayButton?.fontSize).toBe('14px');
    
    // Verify view buttons have consistent styling
    expect(buttonStyles.viewButtons.length).toBe(3);
    buttonStyles.viewButtons.forEach(btnStyle => {
      expect(btnStyle?.fontSize).toBe('14px');
      expect(btnStyle?.fontWeight).toBe('500');
    });

    // 3. Verify proper use of Tailwind CSS classes
    const tailwindUsage = await page.evaluate(() => {
      const tailwindClasses = {
        hasRounded: Array.from(document.querySelectorAll('[class*="rounded"]')).length > 0,
        hasFlex: Array.from(document.querySelectorAll('[class*="flex"]')).length > 0,
        hasGap: Array.from(document.querySelectorAll('[class*="gap-"]')).length > 0,
        hasPadding: Array.from(document.querySelectorAll('[class*="p-"], [class*="px-"], [class*="py-"]')).length > 0,
        hasText: Array.from(document.querySelectorAll('[class*="text-"]')).length > 0,
        hasBg: Array.from(document.querySelectorAll('[class*="bg-"]')).length > 0
      };
      
      return {
        ...tailwindClasses,
        totalTailwindElements: Array.from(document.querySelectorAll('[class*="rounded"], [class*="flex"], [class*="gap-"]')).length
      };
    });

    // Verify Tailwind CSS is being used throughout the app
    expect(tailwindUsage.hasRounded).toBe(true);
    expect(tailwindUsage.hasFlex).toBe(true);
    expect(tailwindUsage.hasGap).toBe(true);
    expect(tailwindUsage.hasPadding).toBe(true);
    expect(tailwindUsage.hasText).toBe(true);
    expect(tailwindUsage.hasBg).toBe(true);
    expect(tailwindUsage.totalTailwindElements).toBeGreaterThan(100);

    // 4. Check that shadcn/ui components are styled consistently
    await page.getByRole('button', { name: '일정 추가' }).click();
    
    // Wait for dialog to open
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    const dialogStyles = await page.evaluate(() => {
      const dialog = document.querySelector('dialog, [role="dialog"]');
      const buttons = Array.from(document.querySelectorAll('dialog button, [role="dialog"] button'));
      const comboboxes = Array.from(document.querySelectorAll('[role="combobox"]'));
      
      const getStyles = (el: Element | null) => {
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          borderRadius: styles.borderRadius,
          border: styles.border,
          padding: styles.padding,
        };
      };
      
      return {
        dialog: getStyles(dialog),
        buttons: buttons.slice(0, 3).map(getStyles),
        comboboxes: comboboxes.slice(0, 2).map(getStyles),
        usesRadixUI: document.querySelector('[data-state]') !== null
      };
    });

    // Verify dialog styling (shadcn/ui component)
    expect(dialogStyles.dialog).toBeTruthy();
    expect(dialogStyles.dialog?.borderRadius).toBe('10px');
    expect(dialogStyles.dialog?.padding).toBe('24px');
    
    // Verify Radix UI primitives are being used
    expect(dialogStyles.usesRadixUI).toBe(true);
    
    // Verify button consistency in dialog
    dialogStyles.buttons.forEach(btnStyle => {
      expect(btnStyle?.borderRadius).toBe('8px');
    });
    
    // Verify combobox styling consistency
    dialogStyles.comboboxes.forEach(comboStyle => {
      expect(comboStyle?.borderRadius).toBe('8px');
    });

    // Close dialog
    await page.getByRole('button', { name: 'Close' }).click();
    
    // Verify dialog closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
