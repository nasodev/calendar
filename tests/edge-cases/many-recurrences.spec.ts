// spec: Edge Cases - Create many recurring instances
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Create many recurring instances', async ({ page }) => {
    // 1. Navigate to calendar (already authenticated via storageState)
    await login(page);

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title "반복 테스트"
    await page.getByRole('textbox', { name: '제목' }).fill('반복 테스트');

    // 4. Enable daily recurrence (매일)
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();
    await page.getByRole('option', { name: '매일' }).click();

    // 5. Set end date far in future (1 year from now)
    await page.getByRole('button', { name: '종료일 선택 (선택사항)' }).click();
    
    // Navigate to January 2027 (1 year from now)
    const nextMonthButton = page.getByRole('button', { name: 'Go to the Next Month' });
    for (let i = 0; i < 12; i++) {
      await nextMonthButton.click();
    }
    
    // Select a date in January 2027
    await page.getByRole('button', { name: 'Saturday, January 31st, 2027' }).click();

    // 6. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // Verify event is created and dialog is closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 7. Navigate through months to verify recurring instances appear
    // Verify event appears in current month (January 2026)
    await expect(page.getByText('반복 테스트').first()).toBeVisible();

    // Navigate to February 2026
    const calendarNextButton = page.getByRole('button').filter({ hasText: '' }).nth(1);
    await calendarNextButton.click();
    
    // Verify recurring instance appears in February
    await expect(page.getByRole('heading', { name: '2026년 2월' })).toBeVisible();
    await expect(page.getByText('반복 테스트').first()).toBeVisible();

    // Navigate to June 2026 (6 months ahead)
    for (let i = 0; i < 4; i++) {
      await calendarNextButton.click();
    }
    
    // Verify recurring instance appears in June
    await expect(page.getByRole('heading', { name: '2026년 6월' })).toBeVisible();
    await expect(page.getByText('반복 테스트').first()).toBeVisible();

    // Navigate to December 2026
    for (let i = 0; i < 6; i++) {
      await calendarNextButton.click();
    }
    
    // Verify recurring instance appears in December
    await expect(page.getByRole('heading', { name: '2026년 12월' })).toBeVisible();
    await expect(page.getByText('반복 테스트').first()).toBeVisible();

    // Navigate to January 2027 (end month)
    await calendarNextButton.click();
    
    // Verify recurring instance appears in final month
    await expect(page.getByRole('heading', { name: '2027년 1월' })).toBeVisible();
    await expect(page.getByText('반복 테스트').first()).toBeVisible();

    // Verify calendar remains responsive after many recurring events
    // Navigate back to current month (January 2026)
    const calendarPrevButton = page.getByRole('button').filter({ hasText: '' }).first();
    for (let i = 0; i < 12; i++) {
      await calendarPrevButton.click();
    }
    
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
    await expect(page.getByText('반복 테스트').first()).toBeVisible();
  });
});
