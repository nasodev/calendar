// spec: Category Management - Change event category
// Authentication: Uses storageState (.auth/user.json) - NO login code

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Category Management', () => {
  test('Change event category', async ({ page }) => {
    // Navigate to calendar page (already authenticated via storageState)
    await login(page);
    
    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    
    // 1. Create event with '운동' category
    await page.getByRole('button', { name: '일정 추가' }).click();
    
    // Fill in event details
    await page.getByLabel('제목').fill('운동 일정 테스트');
    await page.getByLabel('설명').fill('카테고리 변경 테스트');
    
    // Select '운동' category
    await page.getByRole('combobox', { name: '카테고리' }).click();
    await page.getByRole('option', { name: '운동' }).click();
    
    // Save the event
    await page.getByRole('button', { name: '저장' }).click();
    
    // Wait for event to appear on calendar
    await expect(page.getByText('운동 일정 테스트')).toBeVisible();
    
    // Get initial event color (from '운동' category)
    const eventCard = page.getByText('운동 일정 테스트').locator('..');
    const initialColor = await eventCard.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // 2. Edit the event
    await page.getByText('운동 일정 테스트').click();
    
    // Wait for edit dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // 3. Change category to '가족'
    await page.getByRole('combobox', { name: '카테고리' }).click();
    await page.getByRole('option', { name: '가족' }).click();
    
    // 4. Save changes
    await page.getByRole('button', { name: '저장' }).click();
    
    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // 5. Verify event color updates on calendar
    await expect(page.getByText('운동 일정 테스트')).toBeVisible();
    
    // Get updated event color (from '가족' category)
    const updatedColor = await eventCard.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Verify color changed
    expect(updatedColor).not.toBe(initialColor);
    
    // Test changing category to '없음' (removing category)
    await page.getByText('운동 일정 테스트').click();
    
    // Wait for edit dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Change category to '없음'
    await page.getByRole('combobox', { name: '카테고리' }).click();
    await page.getByRole('option', { name: '없음' }).click();
    
    // Save changes
    await page.getByRole('button', { name: '저장' }).click();
    
    // Verify event still exists without category
    await expect(page.getByText('운동 일정 테스트')).toBeVisible();
    
    // Cleanup: Delete the test event
    await page.getByText('운동 일정 테스트').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Look for delete button (assuming there's a delete option in the dialog)
    const deleteButton = page.getByRole('button', { name: /삭제|Delete/i });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      // Confirm deletion if there's a confirmation dialog
      const confirmButton = page.getByRole('button', { name: /확인|Confirm/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    }
  });
});
