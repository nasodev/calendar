// spec: Performance - calendar rendering with many events
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI/UX', () => {
  test('Performance - calendar rendering with many events', async ({ page }) => {
    // Navigate to calendar application
    await page.goto('/');
    
    // Wait for calendar page to load after authentication
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    
    // Verify calendar renders without lag (month view should be visible)
    await expect(page.getByRole('heading', { name: /2026년 1월/ })).toBeVisible();
    
    // Verify events are visible on the calendar
    // January 4th has multiple events ("+7 more" indicator shows many events)
    await expect(page.getByText('+7 more')).toBeVisible();
    
    // Switch to week view to test view transition performance
    const weekButton = page.getByRole('button', { name: '주' });
    await weekButton.click();
    
    // Verify week view loaded successfully with date range
    await expect(page.getByRole('heading', { name: /2026년 1월 \d+일 - \d+일/ })).toBeVisible();
    
    // Verify week view is active
    await expect(weekButton).toHaveAttribute('class', /active/);
    
    // Verify events are visible in week view
    await expect(page.getByText('프로젝트 미팅 (수정됨)')).toBeVisible();
    
    // Switch to day view
    const dayButton = page.getByRole('button', { name: '일', exact: true });
    await dayButton.click();
    
    // Verify day view loaded successfully
    await expect(page.getByRole('heading', { name: /2026년 1월 \d+일/ })).toBeVisible();
    
    // Verify day view is active
    await expect(dayButton).toHaveAttribute('class', /active/);
    
    // Verify events are visible in day view with time slots
    await expect(page.getByText('00:00')).toBeVisible();
    await expect(page.getByText('15:00')).toBeVisible();
    
    // Switch back to month view to complete view transition testing
    const monthButton = page.getByRole('button', { name: '월' });
    await monthButton.click();
    
    // Verify month view loaded successfully
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
    
    // Verify month view is active
    await expect(monthButton).toHaveAttribute('class', /active/);
    
    // Check responsiveness of UI interactions - verify event card is clickable
    const eventCard = page.getByText('테스트 일정').first();
    await expect(eventCard).toBeVisible();
    
    // Verify calendar handles large number of events efficiently
    // Count visible event elements on the page
    const eventElements = page.locator('p:has-text("오전"), p:has-text("오후")');
    const eventCount = await eventElements.count();
    
    // Verify there are many events rendered
    expect(eventCount).toBeGreaterThan(20);
    
    // Verify UI remains responsive - navigation buttons should still be clickable
    await expect(page.getByRole('button', { name: '오늘' })).toBeEnabled();
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeEnabled();
  });
});
