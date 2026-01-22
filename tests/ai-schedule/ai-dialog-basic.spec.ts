// spec: AI Schedule - Basic dialog interactions
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('AI Schedule - Basic Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show AI button for logged-in users', async ({ page }) => {
    // AI button should be visible (either icon-only or with text depending on viewport)
    const aiButton = page.getByRole('button', { name: /AI 등록/ });
    await expect(aiButton).toBeVisible();
  });

  test('should open AI dialog on button click', async ({ page }) => {
    // Click AI button
    await page.getByRole('button', { name: /AI 등록/ }).click();

    // Verify dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('AI 일정 등록')).toBeVisible();
  });

  test('should have input field and image upload button in dialog', async ({ page }) => {
    await page.getByRole('button', { name: /AI 등록/ }).click();

    // Verify input field exists
    const input = page.getByPlaceholder(/내일 오후 3시 치과/);
    await expect(input).toBeVisible();

    // Verify image upload button exists
    await expect(page.getByRole('button', { name: '이미지 추가' })).toBeVisible();

    // Verify action buttons
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
    await expect(page.getByRole('button', { name: '분석하기' })).toBeVisible();
  });

  test('should enable parse button when text is entered', async ({ page }) => {
    await page.getByRole('button', { name: /AI 등록/ }).click();

    const parseButton = page.getByRole('button', { name: '분석하기' });

    // Initially disabled (no input)
    await expect(parseButton).toBeDisabled();

    // Enter text
    await page.getByPlaceholder(/내일 오후 3시 치과/).fill('내일 회의');

    // Now enabled
    await expect(parseButton).toBeEnabled();
  });

  test('should close dialog on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /AI 등록/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should close dialog on overlay click', async ({ page }) => {
    await page.getByRole('button', { name: /AI 등록/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click outside the dialog (on the overlay)
    await page.locator('[data-radix-dialog-overlay]').click({ position: { x: 10, y: 10 } });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
