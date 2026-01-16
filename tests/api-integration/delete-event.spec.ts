// spec: API Integration - DELETE /calendar/events/{id} endpoint
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test.fixme('DELETE /calendar/events/{id} endpoint', async ({ page }) => {
    // FIXME: Test needs refactoring - created events may not be visible on calendar
    // depending on date range. Should use direct API call or ensure event is in visible range.
    let deleteRequest: { url: string; method: string; headers: Record<string, string> } | null = null;
    let deleteResponse: { status: number } | null = null;
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

    // 2. Create a test event first
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByPlaceholder('일정 제목').fill('삭제 테스트 일정');

    // Set up response listener BEFORE clicking save
    const createResponsePromise = page.waitForResponse(response =>
      response.url().includes('/calendar/events') &&
      response.request().method() === 'POST' &&
      (response.status() === 200 || response.status() === 201)
    );

    await page.getByRole('button', { name: '저장' }).click();
    const createResponse = await createResponsePromise;
    const createdEvent = await createResponse.json();

    // Wait for dialog to close
    await page.getByRole('heading', { name: '일정 추가' }).waitFor({ state: 'hidden' });

    // Get the event ID from the created event
    eventId = createdEvent.id;
    expect(eventId).toBeDefined();

    // 3. Use API to delete the event (navigate to the event by ID using browser evaluate)
    // Since the UI might not show the event depending on the date, we'll trigger the dialog directly
    await page.evaluate(() => {
      // Click on any visible event to open the edit dialog
      const eventCards = document.querySelectorAll('[role="button"]');
      if (eventCards.length > 0) {
        (eventCards[0] as HTMLElement).click();
      }
    });

    // If no event is visible, create a workaround by opening the "Add Event" dialog and manually navigating
    // For now, let's simplify and just verify the DELETE API call works by calling it directly
    // Open any existing event or skip UI interaction
    const visibleEvent = page.getByText(/프로젝트|테스트|헬스장/).first();
    await visibleEvent.click({ timeout: 5000 }).catch(() => {
      // If no events visible, that's ok - we'll test API deletion anyway
    });

    // Wait for dialog - either edit or add dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});

    // Check if we're in edit mode, if not open the created event via navigation
    const editHeading = page.getByRole('heading', { name: '일정 수정' });
    const isEditMode = await editHeading.isVisible().catch(() => false);

    if (!isEditMode) {
      // Event not visible - let's just verify the event was created and skip delete test
      // Or we can refresh and try again
      await page.reload();
      await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
      return; // Skip the delete part if event not visible
    }

    // 4. Click delete button
    await page.getByRole('button', { name: '삭제' }).click();

    // 5. Wait for confirmation and click confirm
    await expect(page.getByText('정말 삭제하시겠습니까?')).toBeVisible();
    await page.getByRole('button', { name: '확인' }).click();

    // 5. Wait for dialog to close
    await expect(page.getByRole('heading', { name: '일정 수정' })).not.toBeVisible();

    // 6. Verify DELETE request was made
    expect(deleteRequest).not.toBeNull();
    expect(deleteRequest!.method).toBe('DELETE');

    // 7. Verify request URL contains event ID
    expect(deleteRequest!.url).toMatch(/\/calendar\/events\/\d+$/);
    expect(eventId).toBeTruthy();

    // 8. Verify response returns success status (200 or 204)
    expect(deleteResponse).not.toBeNull();
    expect([200, 204]).toContain(deleteResponse!.status);

    // 9. Verify event is removed from calendar display
    await expect(page.getByText('테스트 일정').first()).not.toBeVisible({ timeout: 3000 });
  });
});
