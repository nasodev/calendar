// spec: API Integration - DELETE /calendar/events/{id} endpoint
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test('DELETE /calendar/events/{id} endpoint', async ({ page }) => {
    let deleteRequest: any = null;
    let deleteResponse: any = null;
    let eventId: string | null = null;

    // Set up request/response listeners before navigating
    page.on('request', request => {
      if (request.method() === 'DELETE' && request.url().includes('/calendar/events/')) {
        deleteRequest = {
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        };
        // Extract event ID from URL
        const match = request.url().match(/\/calendar\/events\/(\d+)$/);
        if (match) {
          eventId = match[1];
        }
      }
    });

    page.on('response', async response => {
      if (response.request().method() === 'DELETE' && response.url().includes('/calendar/events/')) {
        deleteResponse = {
          status: response.status()
        };
      }
    });

    // 1. Navigate to calendar (already authenticated via storageState)
    await login(page);

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Click on an existing event to open it
    await page.getByText('테스트 일정').first().click();

    // Wait for edit dialog to open
    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    // 3. Click delete button
    await page.getByRole('button', { name: '삭제' }).click();

    // 4. Wait for confirmation and click confirm
    await expect(page.getByText('정말 삭제하시겠습니까?')).toBeVisible();
    await page.getByRole('button', { name: '확인' }).click();

    // 5. Wait for dialog to close
    await expect(page.getByRole('heading', { name: '일정 수정' })).not.toBeVisible();

    // 6. Verify DELETE request was made
    expect(deleteRequest).not.toBeNull();
    expect(deleteRequest.method).toBe('DELETE');
    
    // 7. Verify request URL contains event ID
    expect(deleteRequest.url).toMatch(/\/calendar\/events\/\d+$/);
    expect(eventId).toBeTruthy();
    
    // 8. Verify response returns success status (200 or 204)
    expect(deleteResponse).not.toBeNull();
    expect([200, 204]).toContain(deleteResponse.status);

    // 9. Verify event is removed from calendar display
    await expect(page.getByText('테스트 일정').first()).not.toBeVisible({ timeout: 3000 });
  });
});
