import { Page } from '@playwright/test';

/**
 * Login helper for tests
 * Firebase uses IndexedDB, not cookies/localStorage, so Playwright's storageState doesn't work
 */
export async function login(page: Page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: '이름' }).fill('환규');
  await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL('http://localhost:23002/');
}
