# Playwright Test Suite - Setup and Execution Guide

## Overview

Comprehensive E2E test suite for the Family Calendar application using Playwright with Chromium.

**Test Categories:**
- Authentication (7 tests)
- API Integration (17 tests)
- Calendar Views (8 tests)
- Category Management (11 tests)
- Event Management (18 tests)
- Edge Cases (13 tests)
- UI/UX (11 tests)

**Total:** 81 tests across 80 files

## Prerequisites

### 1. Development Environment

- Node.js 18+ installed
- npm packages installed (`npm install`)
- Playwright browsers installed (`npx playwright install chromium`)

### 2. Backend API Running

The calendar frontend requires a running backend API.

```bash
# In the backend repository
# Follow backend setup instructions to start API server
# Default: http://localhost:8000
```

Verify backend is accessible:
```bash
curl http://localhost:8000/health
```

### 3. Firebase Test User Setup

**CRITICAL:** Tests require a specific Firebase user to exist.

**Test User Credentials:**
- **Name:** 환규
- **Email:** 환규@kidchat.local
- **Password:** hwankyu

**Option A: Create via Firebase Console**
1. Go to Firebase Console → Authentication
2. Click "Add User"
3. Email: `환규@kidchat.local`
4. Password: `hwankyu`
5. Click "Add User"

**Option B: Create via Firebase Admin SDK**
```typescript
// admin-create-test-user.ts
import admin from 'firebase-admin';

admin.initializeApp();

async function createTestUser() {
  try {
    const user = await admin.auth().createUser({
      email: '환규@kidchat.local',
      password: 'hwankyu',
      displayName: '환규',
    });
    console.log('Test user created:', user.uid);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
```

**Option C: Manual First Login**
1. Start the dev server: `./run-local.sh`
2. Navigate to http://localhost:23002/login
3. Enter name: `환규`
4. Enter password: `hwankyu`
5. Click login - this will create the Firebase user via auto-registration

**Verify Test User:**
```bash
# Login should succeed and redirect to calendar
# Backend should auto-create calendar member record
```

### 4. Environment Variables

Ensure `.env.local` is configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
# ... other Firebase config
```

## Running Tests

### Quick Start

```bash
# Automatic server management (RECOMMENDED)
# Playwright will start/stop the dev server automatically
npx playwright test

# Manual server management (ALTERNATIVE)
# Terminal 1: Start dev server
./run-local.sh

# Terminal 2: Run tests
npx playwright test
```

### Run Specific Test Categories

```bash
# Authentication tests
npx playwright test tests/authentication/

# API integration tests
npx playwright test tests/api-integration/

# Calendar views tests
npx playwright test tests/calendar-views/

# Event management tests
npx playwright test tests/event-management/

# Category management tests
npx playwright test tests/category-management/

# Edge case tests
npx playwright test tests/edge-cases/

# UI/UX tests
npx playwright test tests/ui-ux/
```

### Run Single Test File

```bash
npx playwright test tests/authentication/login-valid.spec.ts
```

### Run with Specific Options

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode (step through tests)
npx playwright test --debug

# Run specific test by title
npx playwright test -g "Login with valid credentials"

# Run in UI mode (interactive)
npx playwright test --ui

# Run with verbose output
npx playwright test --reporter=list

# Run only failed tests from last run
npx playwright test --last-failed
```

## Debugging Tests

### Method 1: UI Mode (Recommended)

```bash
npx playwright test --ui
```

- Interactive test runner
- Time travel debugging
- Visual test selector
- Instant test execution

### Method 2: Debug Mode

```bash
npx playwright test tests/authentication/login-valid.spec.ts --debug
```

- Opens Playwright Inspector
- Step through test execution
- Inspect DOM at each step
- View console logs

### Method 3: Headed Mode

```bash
npx playwright test --headed --slowMo=1000
```

- See browser in action
- Slow down execution (optional)
- Useful for visual verification

### Method 4: Screenshots and Traces

```bash
# Take screenshot on failure (enabled by default)
npx playwright test

# Generate trace files
npx playwright test --trace on

# View trace files
npx playwright show-trace trace.zip
```

## Test Reports

### HTML Report (Default)

```bash
# Run tests (generates HTML report)
npx playwright test

# View report
npx playwright show-report
```

### Other Report Formats

```bash
# List format (stdout)
npx playwright test --reporter=list

# JSON format (CI/CD integration)
npx playwright test --reporter=json

# JUnit format (CI/CD integration)
npx playwright test --reporter=junit
```

## Common Issues and Solutions

### Issue: "waiting for navigation to http://localhost:23002/"

**Cause:** Dev server not running on port 23002

**Solution:**
```bash
# Option 1: Use automatic server management
npx playwright test
# (playwright.config.ts webServer will start it)

# Option 2: Manually start server
./run-local.sh
# Then run tests in another terminal
```

### Issue: "Failed to load resource: the server responded with a status of 400" (Firebase Auth)

**Cause:** Firebase test user doesn't exist

**Solution:**
Create the test user in Firebase (see "Firebase Test User Setup" above)

### Issue: "Test timeout of 30000ms exceeded"

**Cause:** Element not found or server too slow

**Solutions:**
1. Verify dev server is running
2. Check that selectors match actual DOM
3. Increase timeout in test if needed:
   ```typescript
   test('slow test', async ({ page }) => {
     test.setTimeout(60000); // 60 seconds
     // ... test code
   });
   ```

### Issue: "strict mode violation: locator resolved to X elements"

**Cause:** Selector matches multiple elements

**Solution:**
Add `.first()` to selector:
```typescript
// ❌ FAILS
await page.getByText('15').click();

// ✅ WORKS
await page.getByText('15').first().click();
```

### Issue: Backend API not responding

**Cause:** Backend server not started or wrong URL

**Solutions:**
1. Start backend server
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check backend health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```

## Test Structure

### Helper Functions

**`tests/helpers/auth.ts`**
```typescript
export async function login(page: Page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: '이름' }).fill('환규');
  await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL('http://localhost:23002/');
}
```

Most tests use this helper for authentication since Firebase uses IndexedDB (not compatible with Playwright's storageState).

### Test Organization

```
tests/
├── authentication/          # Login, logout, session tests
├── api-integration/         # Backend API connectivity tests
├── calendar-views/          # Month/week/day view tests
├── category-management/     # Category CRUD tests
├── event-management/        # Event CRUD and recurring tests
├── edge-cases/             # Boundary conditions and error cases
├── ui-ux/                  # Accessibility, responsiveness, performance
└── helpers/                # Shared test utilities
    └── auth.ts            # Login helper
```

## Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Feature Category', () => {
  test('Test description', async ({ page }) => {
    // 1. Setup - login if needed
    await login(page);

    // 2. Navigate to page
    await page.goto('/');

    // 3. Perform actions
    await page.getByRole('button', { name: 'Click me' }).click();

    // 4. Assert expected results
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Role-based Selectors** (preferred)
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   page.getByRole('textbox', { name: 'Email' })
   ```

2. **Use Test IDs for Dynamic Content**
   ```typescript
   page.getByTestId('user-menu')
   ```

3. **Wait for Navigation**
   ```typescript
   await page.waitForURL('http://localhost:23002/');
   ```

4. **Use Explicit Assertions**
   ```typescript
   await expect(element).toBeVisible();
   await expect(element).toHaveText('Expected text');
   ```

5. **Handle Multiple Matches**
   ```typescript
   // Use .first() or .nth(index) for ambiguous selectors
   await page.getByText('Delete').first().click();
   ```

6. **Clean Up After Tests**
   ```typescript
   test.afterEach(async ({ page }) => {
     // Clean up created data
   });
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps chromium

    - name: Start backend (mock/test environment)
      run: |
        # Start test backend server
        npm run start:backend:test &

    - name: Run Playwright tests
      run: npx playwright test
      env:
        NEXT_PUBLIC_API_URL: http://localhost:8000

    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Performance Optimization

### Parallel Execution

Tests run in parallel by default (`fullyParallel: true` in config).

```bash
# Control number of workers
npx playwright test --workers=4

# Run tests serially (debugging)
npx playwright test --workers=1
```

### Test Filtering

```bash
# Run only tests with specific tag
npx playwright test --grep @smoke

# Skip tests with specific tag
npx playwright test --grep-invert @slow
```

### Reuse Browser Context

```typescript
// For tests that don't need isolation
test.describe.configure({ mode: 'serial' });
```

## Maintenance

### Update Playwright

```bash
# Update Playwright
npm install -D @playwright/test@latest

# Update browsers
npx playwright install
```

### Regenerate Test Artifacts

```bash
# Regenerate auth state (if using storageState)
npx playwright test tests/auth.setup.ts

# Clear test artifacts
rm -rf playwright-report/ test-results/
```

## Support and Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Test Coverage Goals

- ✅ Authentication flows
- ✅ API integration points
- ✅ Core calendar functionality (views, navigation)
- ✅ Event management (CRUD, recurring)
- ✅ Category management
- ✅ Edge cases and error handling
- ✅ Accessibility (WCAG compliance)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Performance benchmarks

**Target:** 80%+ test coverage of user-facing features

---

**Last Updated:** 2026-01-05
**Maintained By:** Development Team
