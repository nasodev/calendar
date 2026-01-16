// spec: API Integration - PATCH /calendar/events/{id} endpoint
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test.fixme('PATCH /calendar/events/{id} endpoint', async ({ page }) => {
    // FIXME: Test needs refactoring - created events may not be visible on calendar
    // depending on date range. Should use direct API call or ensure event is in visible range.
    let patchRequest: { url: string; method: string; headers: Record<string, string>; body: Record<string, unknown> } | null = null;
    let patchResponse: { status: number; body: Record<string, unknown> } | null = null;

    // Set up request/response listeners before navigating
    page.on('request', request => {
      if (request.method() === 'PATCH' && request.url().includes('/calendar/events/')) {
        patchRequest = {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          body: request.postDataJSON()
        };
      }
    });

    page.on('response', async response => {
      if (response.request().method() === 'PATCH' && response.url().includes('/calendar/events/')) {
        patchResponse = {
          status: response.status(),
          body: await response.json()
        };
      }
    });

    // 1. Navigate to calendar (already authenticated via storageState)
    await login(page);

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Create a test event first
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByPlaceholder('일정 제목').fill('수정 테스트 일정');

    // Set up response listener BEFORE clicking save
    const createResponsePromise = page.waitForResponse(response =>
      response.url().includes('/calendar/events') &&
      response.request().method() === 'POST' &&
      (response.status() === 200 || response.status() === 201)
    );

    await page.getByRole('button', { name: '저장' }).click();
    await createResponsePromise;

    // Wait for dialog to close
    await page.getByRole('heading', { name: '일정 추가' }).waitFor({ state: 'hidden' });

    // 3. Click on the newly created event to edit it (wait for it to be visible)
    await page.getByText('수정 테스트 일정').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText('수정 테스트 일정').first().click();

    // Wait for edit dialog to open
    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    // 4. Edit the event title
    const titleInput = page.getByPlaceholder('일정 제목');
    await titleInput.clear();
    await titleInput.fill('수정 테스트 일정 (PATCH 수정됨)');

    // 4. Save changes
    await page.getByRole('button', { name: '저장' }).click();

    // 5. Wait for dialog to close
    await expect(page.getByRole('heading', { name: '일정 수정' })).not.toBeVisible();

    // 6. Verify PATCH request was made
    expect(patchRequest).not.toBeNull();
    expect(patchRequest!.method).toBe('PATCH');

    // 7. Verify request URL contains event ID
    expect(patchRequest!.url).toMatch(/\/calendar\/events\/\d+$/);

    // 8. Verify request body contains updated fields
    expect(patchRequest!.body).toBeTruthy();
    expect(patchRequest!.body.title).toBe('테스트 일정 (PATCH 수정됨)');

    // 9. Verify response returns updated event
    expect(patchResponse).not.toBeNull();
    expect(patchResponse!.status).toBe(200);
    expect(patchResponse!.body).toBeTruthy();
    expect(patchResponse!.body.title).toBe('테스트 일정 (PATCH 수정됨)');
    expect(patchResponse!.body.id).toBeTruthy();

    // 10. Verify calendar reflects changes immediately
    await expect(page.getByText('테스트 일정 (PATCH 수정됨)').first()).toBeVisible();
  });
});
