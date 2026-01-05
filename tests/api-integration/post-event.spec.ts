// spec: POST /calendar/events endpoint
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('API Integration', () => {
  test('POST /calendar/events endpoint', async ({ page }) => {
    // Set up request and response capture
    let postRequest: any = null;
    let postResponse: any = null;

    // 1. Navigate to calendar page (already authenticated)
    await login(page);

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // Capture POST request and response
    page.on('request', request => {
      if (request.url().includes('/calendar/events') && request.method() === 'POST') {
        postRequest = {
          url: request.url(),
          method: request.method(),
          body: request.postDataJSON(),
          headers: request.headers()
        };
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/calendar/events') && response.request().method() === 'POST') {
        postResponse = {
          status: response.status(),
          body: await response.json().catch(() => null)
        };
      }
    });

    // 2. Create a new event via UI
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Fill in event details
    await page.getByRole('textbox', { name: '제목' }).fill('API 테스트 이벤트');
    await page.getByRole('textbox', { name: '설명' }).fill('POST 요청 테스트를 위한 이벤트');

    // Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // Wait for dialog to close (event created)
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 3. Verify POST request was made
    expect(postRequest).not.toBeNull();
    expect(postRequest.method).toBe('POST');
    expect(postRequest.url).toContain('/calendar/events');

    // 4. Verify request body includes required fields
    expect(postRequest.body).toHaveProperty('title', 'API 테스트 이벤트');
    expect(postRequest.body).toHaveProperty('description', 'POST 요청 테스트를 위한 이벤트');
    // Backend uses start_time/end_time, not start/end
    expect(postRequest.body).toHaveProperty('start_time');
    expect(postRequest.body).toHaveProperty('end_time');
    
    // Note: category_id and recurrence_pattern are optional and may not be present in the request body

    // Verify authorization header is present
    expect(postRequest.headers).toHaveProperty('authorization');
    expect(postRequest.headers.authorization).toContain('Bearer');

    // 5. Verify response returns created event with id
    expect(postResponse).not.toBeNull();
    expect(postResponse.status).toBe(201); // 201 Created for POST
    expect(postResponse.body).toHaveProperty('id');
    expect(postResponse.body).toHaveProperty('title', 'API 테스트 이벤트');
    expect(postResponse.body).toHaveProperty('description', 'POST 요청 테스트를 위한 이벤트');

    // 6. Verify event ID exists (can be number or string)
    expect(postResponse.body.id).toBeDefined();
    expect(postResponse.body.id).toBeTruthy();

    // Note: Event may not be visible on calendar if created date is outside current view
    // The API response verification above confirms the event was created successfully
  });
});
