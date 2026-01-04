// spec: Korean Localization Test
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Korean localization', async ({ page }) => {
    // Navigate to the calendar application (already authenticated via storageState)
    await login(page);

    // Verify calendar header Korean labels
    // Verify 'Add Event' button is in Korean (일정 추가)
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // Verify 'Today' button is in Korean (오늘)
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();

    // Verify 'Month' view button is in Korean (월)
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();

    // Verify 'Week' view button is in Korean (주)
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();

    // Verify 'Day' view button is in Korean (일)
    await expect(page.getByRole('button', { name: '일' })).toBeVisible();

    // Check date formatting uses Korean format (년, 월)
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();

    // Verify day names are in Korean (일, 월, 화, 수, 목, 금, 토)
    // Verify Sunday day name is in Korean (일)
    await expect(page.getByText('일').first()).toBeVisible();

    // Verify Monday day name is in Korean (월)
    await expect(page.getByText('월').first()).toBeVisible();

    // Verify Tuesday day name is in Korean (화)
    await expect(page.getByText('화')).toBeVisible();

    // Verify Wednesday day name is in Korean (수)
    await expect(page.getByText('수')).toBeVisible();

    // Verify Thursday day name is in Korean (목)
    await expect(page.getByText('목')).toBeVisible();

    // Verify Friday day name is in Korean (금)
    await expect(page.getByText('금')).toBeVisible();

    // Verify Saturday day name is in Korean (토)
    await expect(page.getByText('토')).toBeVisible();

    // Click "일정 추가" button to open event dialog
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Verify event dialog Korean labels
    // Verify dialog heading 'Add Event' is in Korean
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();

    // Verify dialog has Korean form labels by checking the dialog content
    const dialog = page.getByRole('dialog', { name: '일정 추가' });
    await expect(dialog).toBeVisible();

    // Verify Korean labels in the event form
    await expect(dialog.getByText('제목')).toBeVisible();
    await expect(dialog.getByText('설명')).toBeVisible();
    await expect(dialog.getByText('시작일')).toBeVisible();
    await expect(dialog.getByText('시작 시간')).toBeVisible();
    await expect(dialog.getByText('종료일')).toBeVisible();
    await expect(dialog.getByText('종료 시간')).toBeVisible();
    await expect(dialog.getByText('카테고리')).toBeVisible();
    await expect(dialog.getByText('반복')).toBeVisible();
    await expect(dialog.getByText('종일')).toBeVisible();

    // Verify action buttons are in Korean
    await expect(dialog.getByRole('button', { name: '저장' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: '취소' })).toBeVisible();

    // Verify date format in date picker buttons uses Korean format
    await expect(dialog.getByRole('button', { name: /2026년 \d+월 \d+일/ })).toHaveCount(2);

    // Close dialog
    await page.getByRole('button', { name: '취소' }).click();

    // Verify no English fallback text appears - check time format is Korean (오전/오후)
    await expect(page.getByText('오전').first()).toBeVisible();
    await expect(page.getByText('오후').first()).toBeVisible();
  });
});
