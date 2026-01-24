# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Docker (로컬 개발)

```bash
./run-local.sh              # Docker로 실행 (기본)
./run-local.sh npm          # npm으로 실행 (기존 방식)
./run-local.sh restart      # Docker 재시작

# 또는 직접
docker compose up --build
```

### npm (기존 방식)

```bash
npm run dev          # Start dev server on port 3002
npm run build        # Production build
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check without emitting
```

### 포트 구성

| 환경 | 포트 | URL |
|------|------|-----|
| 로컬 개발 | 23004 | http://localhost:23004 |
| 프로덕션 | 3002 | Nginx → localhost:3002 |

## Architecture

Family calendar app with Next.js 16 frontend and FastAPI backend (separate repo).

### Tech Stack
- Next.js 16 with React 19, TypeScript
- Tailwind CSS 4 with shadcn/ui components (Radix UI primitives)
- Firebase Authentication (email/password with name-to-email mapping)
- date-fns for date formatting (Korean locale)

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main calendar page (protected)
│   └── login/page.tsx     # Login page
├── components/
│   ├── calendar/          # Calendar-specific components
│   │   ├── MonthView.tsx  # Month grid view
│   │   ├── WeekView.tsx   # Week view with time slots
│   │   ├── DayView.tsx    # Day view with hourly grid
│   │   ├── EventDialog.tsx    # Event create/edit dialog
│   │   ├── CategoryDialog.tsx # Category management
│   │   ├── CalendarHeader.tsx # Navigation and view switcher
│   │   └── EventCard.tsx  # Event display card
│   └── ui/                # shadcn/ui components
├── hooks/
│   └── useAuth.ts         # Firebase auth hook
└── lib/
    ├── api.ts             # Backend API client with Bearer token
    ├── auth.ts            # Firebase auth helpers
    ├── firebase.ts        # Firebase initialization
    └── utils.ts           # Tailwind merge utility
```

### Key Patterns

**Authentication Flow**: Login converts name to email (`{name}@kidchat.local`), Firebase handles auth, `useAuth` hook provides user state. Auto-registration creates calendar member on first login.

**API Client** (`src/lib/api.ts`): All backend calls use `fetchWithAuth()` which injects Firebase Bearer token. Backend URL from `NEXT_PUBLIC_API_URL` env var.

**Recurring Events**: Uses RFC 5545 RRULE standard via `RecurrencePattern` interface:
```typescript
interface RecurrencePattern {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  weekdays?: ('MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU')[];
}
```
Backend returns `occurrence_date` for each instance of recurring events.

**Date Handling**: Use local date methods (`getFullYear()`, `getMonth()`, `getDate()`) for comparisons to avoid timezone issues. Never use `toISOString().split('T')[0]` for display dates in KST timezone.

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8000`)

### Backend API Endpoints

All endpoints prefixed with `/calendar/`:
- `GET /auth/verify` - Verify member and get profile
- `GET|POST /members` - List/create members
- `GET|POST /categories` - List/create categories
- `GET /events?start_date=&end_date=` - List events (returns `{ events: [...] }`)
- `POST /events` - Create event (supports `recurrence_pattern`)
- `PATCH|DELETE /events/{id}` - Update/delete event
