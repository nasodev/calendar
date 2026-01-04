import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Leap year handling', async ({ page }) => {
    // Navigate to calendar (already authenticated via storageState)
    await login(page);

    // Navigate to February 2028 (a leap year)
    await page.evaluate(`async () => {
      const heading = document.querySelector('h2');
      const parent = heading?.parentElement?.parentElement;
      const buttons = parent?.querySelectorAll('button');
      const nextBtn = Array.from(buttons || [])[1];
      
      // Navigate from current month to February 2028
      for (let i = 0; i < 25; i++) {
        if (nextBtn) {
          nextBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          await new Promise(r => setTimeout(r, 50));
        }
      }
    }`);

    // Verify February 2028 is displayed
    await expect(page.getByText('2028년 2월')).toBeVisible();

    // Verify February has 29 days displayed
    await expect(page.getByText('29').first()).toBeVisible();

    // Create an event on February 29, 2028
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('Leap Year Event');

    // Click start date button to change date
    await page.getByRole('button', { name: '년 1월 4일' }).first().click();

    // Navigate date picker to February 2028
    await page.evaluate(`async () => {
      const nextBtn = document.querySelector('button[aria-label="Go to the Next Month"]');
      
      // Navigate to February 2028
      for (let i = 0; i < 25; i++) {
        if (nextBtn) {
          nextBtn.click();
          await new Promise(r => setTimeout(r, 50));
        }
      }
    }`);

    // Select February 29, 2028
    await page.getByRole('button', { name: 'Tuesday, February 29th,' }).click();

    // Close the date picker
    await page.keyboard.press('Escape');

    // Verify the event is displayed on February 29
    await expect(page.getByRole('button', { name: '2028년 2월 29일' })).toBeVisible();
  });
});
