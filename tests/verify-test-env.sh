#!/bin/bash

# Test Environment Verification Script
# Checks that all prerequisites for Playwright tests are met

set -e

echo "=========================================="
echo "Playwright Test Environment Verification"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "1. Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check npm
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check if node_modules exists
echo "3. Checking node_modules..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${RED}✗${NC} node_modules not found. Run: npm install"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check Playwright installation
echo "4. Checking Playwright..."
if [ -f "node_modules/.bin/playwright" ]; then
    PLAYWRIGHT_VERSION=$(npx playwright --version)
    echo -e "${GREEN}✓${NC} Playwright installed: $PLAYWRIGHT_VERSION"
else
    echo -e "${RED}✗${NC} Playwright not found. Run: npm install -D @playwright/test"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check Playwright browsers
echo "5. Checking Playwright browsers..."
if npx playwright list-files &> /dev/null; then
    echo -e "${GREEN}✓${NC} Playwright browsers installed"
else
    echo -e "${YELLOW}⚠${NC} Playwright browsers may not be installed. Run: npx playwright install chromium"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check if dev server is running on port 23002
echo "6. Checking dev server (port 23002)..."
if curl -s http://localhost:23002 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dev server is running on http://localhost:23002"
else
    echo -e "${YELLOW}⚠${NC} Dev server not detected on port 23002"
    echo "   To start: ./run-local.sh"
    echo "   Or enable webServer in playwright.config.ts"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check backend API
echo "7. Checking backend API (port 8000)..."
BACKEND_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}"
if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend API is running at $BACKEND_URL"
elif curl -s "$BACKEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend API is running at $BACKEND_URL"
else
    echo -e "${YELLOW}⚠${NC} Backend API not detected at $BACKEND_URL"
    echo "   Backend must be running for tests to pass"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check environment variables
echo "8. Checking environment variables..."
ENV_MISSING=0

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local file exists"

    # Check for required Firebase variables
    if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_FIREBASE_API_KEY found"
    else
        echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_FIREBASE_API_KEY not found in .env.local"
        ENV_MISSING=$((ENV_MISSING + 1))
    fi

    if grep -q "NEXT_PUBLIC_FIREBASE_PROJECT_ID" .env.local; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_FIREBASE_PROJECT_ID found"
    else
        echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_FIREBASE_PROJECT_ID not found in .env.local"
        ENV_MISSING=$((ENV_MISSING + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} .env.local file not found"
    echo "   Create .env.local with Firebase configuration"
    ENV_MISSING=1
fi

if [ $ENV_MISSING -gt 0 ]; then
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check Firebase test user (manual verification required)
echo "9. Firebase test user verification..."
echo -e "${YELLOW}⚠${NC} Manual verification required:"
echo "   Test user must exist in Firebase:"
echo "   - Email: 환규@kidchat.local"
echo "   - Password: hwankyu"
echo ""
echo "   To verify:"
echo "   1. Open http://localhost:23002/login (with server running)"
echo "   2. Enter name: 환규"
echo "   3. Enter password: hwankyu"
echo "   4. Login should succeed"
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You can now run Playwright tests:"
    echo "  npx playwright test"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo ""
    echo "Tests may run but could fail due to warnings."
    echo "Review warnings above and fix if needed."
    echo ""
    echo "To run tests anyway:"
    echo "  npx playwright test"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) and $WARNINGS warning(s) found${NC}"
    echo ""
    echo "Fix errors before running tests."
    exit 1
fi
