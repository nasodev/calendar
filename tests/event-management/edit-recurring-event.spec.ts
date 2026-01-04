// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Recurring', () => {
  test('Edit recurring event', async ({ page }) => {
    // Navigate to the calendar application
    await login(page);
    
    // 2. Click on an existing recurring event on the calendar
    await page.getByText('프로젝트 미팅').first().click();
    
    // 3. Modify the event title
    await page.getByRole('textbox', { name: '제목' }).fill('프로젝트 미팅 (수정됨)');
    
    // 4. Save the changes
    await page.getByRole('button', { name: '저장' }).click();
    
    // 5. Verify all instances of the recurring event are updated
    await expect(page.getByText('프로젝트 미팅 (수정됨)')).toBeVisible();
  });
});
