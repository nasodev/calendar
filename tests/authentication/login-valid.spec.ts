// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Login with valid credentials', async ({ page }) => {
    // 1. Navigate to http://localhost:23002
    await page.goto('http://localhost:23002');

    // 2. Verify redirect to /login page
    await page.getByText("이름").first().waitFor({ state: 'visible' });

    // 3. Enter '환규' in the 이름 (name) field
    await page.getByRole('textbox', { name: '이름' }).fill('환규');

    // 4. Enter 'hwankyu' in the 비밀번호 (password) field
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');

    // 5. Click the 로그인 (Login) button
    await page.getByRole('button', { name: '로그인' }).click();

    // Verify successful login redirects to main calendar page showing month view
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();

    // Verify user session is established with calendar functionality available
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
