# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3002
npm run build        # Production build
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check without emitting
```

For local development on alternate port:
```bash
./run-local.sh       # Runs on port 23002
```

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
