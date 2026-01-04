// spec: UI/UX - Page Load Performance Test
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI/UX', () => {
  test('Performance - page load time', async ({ page, context }) => {
    // 1. Clear browser cache
    await context.clearCookies();
    await context.clearPermissions();
    
    // Record start time
    const startTime = Date.now();
    
    // 2. Navigate to the application (already authenticated via storageState)
    await page.goto('/');
    
    // 3. Measure time to interactive using performance.timing API
    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        // Total page load time (from navigation start to load complete)
        pageLoadTime: timing.loadEventEnd - timing.navigationStart,
        
        // Time to DOM Content Loaded (critical for interactivity)
        domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart,
        
        // Time to Interactive (when page becomes interactive)
        timeToInteractive: timing.domInteractive - timing.navigationStart,
        
        // DOM processing time
        domProcessingTime: timing.domComplete - timing.domLoading,
        
        // Response time (server response)
        responseTime: timing.responseEnd - timing.requestStart,
        
        // Using Navigation Timing API Level 2 if available
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.startTime : 0,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.startTime : 0,
      };
    });
    
    // Wait for calendar data to load by checking for the "일정 추가" button
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible({ timeout: 3000 });
    
    // Calculate total time from navigation start to calendar ready
    const endTime = Date.now();
    const totalLoadTime = endTime - startTime;
    
    // 4. Verify page loads within acceptable time (<3 seconds)
    console.log('Performance Metrics:');
    console.log(`- Total Load Time: ${totalLoadTime}ms`);
    console.log(`- Page Load Time (loadEventEnd): ${performanceMetrics.pageLoadTime}ms`);
    console.log(`- DOM Content Loaded: ${performanceMetrics.domContentLoadedTime}ms`);
    console.log(`- Time to Interactive: ${performanceMetrics.timeToInteractive}ms`);
    console.log(`- DOM Processing Time: ${performanceMetrics.domProcessingTime}ms`);
    console.log(`- Server Response Time: ${performanceMetrics.responseTime}ms`);
    
    // Verify page loads under 3 seconds
    expect(totalLoadTime).toBeLessThan(3000);
    
    // Verify calendar data loads within 1-2 seconds (time to interactive)
    expect(performanceMetrics.timeToInteractive).toBeLessThan(2000);
    
    // Verify DOM Content Loaded happens quickly (should be under 1 second)
    expect(performanceMetrics.domContentLoadedTime).toBeLessThan(1000);
    
    // Verify server response is fast (should be under 500ms)
    expect(performanceMetrics.responseTime).toBeLessThan(500);
    
    // Verify no blocking resources delay interactivity
    // Check that the calendar is fully interactive
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();
    await expect(page.getByRole('button', { name: '주' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일' })).toBeVisible();
    
    // Verify loading indicators are not present (page has finished loading)
    // If there are any loading spinners, they should be gone
    await expect(page.locator('[role="progressbar"]')).toHaveCount(0);
    await expect(page.locator('.loading')).toHaveCount(0);
    await expect(page.getByText('로딩')).toHaveCount(0);
    await expect(page.getByText('Loading')).toHaveCount(0);
  });
});
