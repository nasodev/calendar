# Family Calendar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a family shared calendar web app where 5-8 family members can view and manage events together.

**Architecture:** Next.js 16.1.1 frontend with shadcn/ui components, Firebase Auth (shared with kid-chat), FastAPI backend (extending existing backend-api), PostgreSQL database.

**Tech Stack:** Next.js 16.1.1, shadcn/ui, Tailwind CSS, Firebase Auth, FastAPI, SQLAlchemy, PostgreSQL, RRULE (RFC 5545)

**Design Reference:** https://calendar-shadcn.vercel.app/

---

## Phase 1: Frontend Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `calendar/package.json`
- Create: `calendar/tsconfig.json`
- Create: `calendar/next.config.ts`
- Create: `calendar/tailwind.config.ts`
- Create: `calendar/src/app/layout.tsx`
- Create: `calendar/src/app/page.tsx`

**Step 1: Create Next.js project with TypeScript**

```bash
cd /Users/hklee03-macbook/dev/funq/calendar
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select options:
- Would you like to use Turbopack? No

**Step 2: Verify project created**

```bash
ls -la src/app/
```

Expected: `layout.tsx`, `page.tsx`, `globals.css`

**Step 3: Run dev server to verify**

```bash
npm run dev
```

Expected: Server starts at http://localhost:3000

**Step 4: Stop dev server and commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js 16.1.1 project with TypeScript and Tailwind"
```

---

### Task 2: Install and Configure shadcn/ui

**Files:**
- Modify: `calendar/tailwind.config.ts`
- Create: `calendar/components.json`
- Create: `calendar/src/lib/utils.ts`
- Create: `calendar/src/components/ui/button.tsx`

**Step 1: Initialize shadcn/ui**

```bash
cd /Users/hklee03-macbook/dev/funq/calendar
npx shadcn@latest init
```

Select options:
- Which style would you like to use? Default
- Which color would you like to use as base color? Slate
- Would you like to use CSS variables for colors? Yes

**Step 2: Install essential components**

```bash
npx shadcn@latest add button input label card dialog select popover calendar
```

**Step 3: Verify components installed**

```bash
ls src/components/ui/
```

Expected: `button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`, `dialog.tsx`, `select.tsx`, `popover.tsx`, `calendar.tsx`

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui with essential components"
```

---

### Task 3: Configure Firebase

**Files:**
- Create: `calendar/src/lib/firebase.ts`
- Create: `calendar/.env.local`

**Step 1: Install Firebase**

```bash
cd /Users/hklee03-macbook/dev/funq/calendar
npm install firebase
```

**Step 2: Create Firebase config file**

Create `src/lib/firebase.ts`:

```typescript
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDxtXl0mnUpaMhkTPhlbYVr9o49oX7sJks",
  authDomain: "kid-chat-2ca0f.firebaseapp.com",
  projectId: "kid-chat-2ca0f",
  storageBucket: "kid-chat-2ca0f.firebasestorage.app",
  messagingSenderId: "1097422182914",
  appId: "1:1097422182914:web:cb798a95684b0b0c39e51b",
  measurementId: "G-YSWET2DE8E"
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
```

**Step 3: Create environment file**

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Step 4: Add .env.local to .gitignore**

Verify `.gitignore` contains:
```
.env*.local
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add Firebase configuration (shared with kid-chat)"
```

---

### Task 4: Create Auth Hook

**Files:**
- Create: `calendar/src/hooks/useAuth.ts`
- Create: `calendar/src/lib/auth.ts`

**Step 1: Create auth utilities**

Create `src/lib/auth.ts`:

```typescript
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth } from './firebase';

export function nameToEmail(name: string): string {
  return `${name}@kidchat.local`;
}

export async function login(name: string, password: string): Promise<User> {
  const email = nameToEmail(name);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
```

**Step 2: Create auth hook**

Create `src/hooks/useAuth.ts`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { login as authLogin, logout as authLogout, getIdToken } from '@/lib/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false, error: null });
    });
    return unsubscribe;
  }, []);

  const login = async (name: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await authLogin(name, password);
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: '이름 또는 비밀번호가 틀렸습니다'
      }));
      throw err;
    }
  };

  const logout = async () => {
    await authLogout();
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    getIdToken,
  };
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add Firebase auth hook and utilities"
```

---

### Task 5: Create Login Page

**Files:**
- Create: `calendar/src/app/login/page.tsx`
- Modify: `calendar/src/app/page.tsx`
- Modify: `calendar/src/app/layout.tsx`

**Step 1: Create login page**

Create `src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(name, password);
      router.push('/');
    } catch {
      // Error is handled by useAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">가족 캘린더</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Update main page with auth redirect**

Update `src/app/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">가족 캘린더</h1>
      <p>환영합니다! 캘린더가 곧 여기에 표시됩니다.</p>
    </div>
  );
}
```

**Step 3: Run and verify login page**

```bash
npm run dev
```

Navigate to http://localhost:3000/login and verify the login form renders.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add login page with Firebase auth"
```

---

## Phase 2: Backend API

### Task 6: Create Database Models

**Files:**
- Create: `backend-api/app/models/calendar.py`
- Modify: `backend-api/app/models/__init__.py`

**Step 1: Create calendar models**

Create `app/models/calendar.py` in backend-api:

```python
"""캘린더 관련 데이터베이스 모델"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Boolean, Text, ForeignKey, DateTime, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.external.database import Base


class FamilyMember(Base):
    """가족 구성원"""
    __tablename__ = "family_members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    firebase_uid: Mapped[Optional[str]] = mapped_column(
        String(128), unique=True, nullable=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(7), nullable=False)  # #RRGGBB
    is_registered: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Relationships
    events: Mapped[list["Event"]] = relationship(back_populates="creator")


class Category(Base):
    """일정 카테고리"""
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str] = mapped_column(String(7), nullable=False)  # #RRGGBB
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    events: Mapped[list["Event"]] = relationship(back_populates="category")


class Event(Base):
    """일정"""
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    all_day: Mapped[bool] = mapped_column(Boolean, default=False)

    # Foreign Keys
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=False
    )

    # Recurrence
    recurrence_rule: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )  # RRULE format
    recurrence_start: Mapped[Optional[datetime]] = mapped_column(
        Date, nullable=True
    )
    recurrence_end: Mapped[Optional[datetime]] = mapped_column(
        Date, nullable=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    category: Mapped[Optional["Category"]] = relationship(back_populates="events")
    creator: Mapped["FamilyMember"] = relationship(back_populates="events")
    exceptions: Mapped[list["RecurrenceException"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )


class RecurrenceException(Base):
    """반복 일정 예외"""
    __tablename__ = "recurrence_exceptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id"), nullable=False
    )
    original_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    modified_event: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Relationships
    event: Mapped["Event"] = relationship(back_populates="exceptions")
```

**Step 2: Update models __init__.py**

Update `app/models/__init__.py`:

```python
from app.models.calendar import FamilyMember, Category, Event, RecurrenceException

__all__ = ["FamilyMember", "Category", "Event", "RecurrenceException"]
```

**Step 3: Run type check**

```bash
cd /Users/hklee03-macbook/dev/funq/backend-api
python -c "from app.models import FamilyMember, Category, Event, RecurrenceException; print('Models loaded successfully')"
```

Expected: "Models loaded successfully"

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add calendar database models (FamilyMember, Category, Event, RecurrenceException)"
```

---

### Task 7: Create Alembic Migration

**Files:**
- Create: `backend-api/alembic/versions/xxxx_add_calendar_tables.py`

**Step 1: Generate migration**

```bash
cd /Users/hklee03-macbook/dev/funq/backend-api
alembic revision --autogenerate -m "add calendar tables"
```

**Step 2: Review generated migration**

```bash
cat alembic/versions/*add_calendar_tables*.py
```

Verify it creates: `family_members`, `categories`, `events`, `recurrence_exceptions` tables.

**Step 3: Apply migration**

```bash
alembic upgrade head
```

Expected: Migration applies successfully.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add migration for calendar tables"
```

---

### Task 8: Create Pydantic Schemas

**Files:**
- Create: `backend-api/app/schemas/calendar.py`
- Modify: `backend-api/app/schemas/__init__.py`

**Step 1: Create calendar schemas**

Create `app/schemas/calendar.py`:

```python
"""캘린더 API 스키마"""

from datetime import datetime, date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


# ============ FamilyMember ============

class FamilyMemberBase(BaseModel):
    display_name: str
    color: str

    @field_validator('color')
    @classmethod
    def validate_color(cls, v: str) -> str:
        if not v.startswith('#') or len(v) != 7:
            raise ValueError('Color must be in #RRGGBB format')
        return v


class FamilyMemberCreate(FamilyMemberBase):
    pass


class FamilyMemberUpdate(BaseModel):
    display_name: Optional[str] = None
    color: Optional[str] = None


class FamilyMemberResponse(FamilyMemberBase):
    id: UUID
    email: str
    is_registered: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Category ============

class CategoryBase(BaseModel):
    name: str
    color: str
    icon: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# ============ Event ============

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    all_day: bool = False
    category_id: Optional[UUID] = None
    recurrence_rule: Optional[str] = None
    recurrence_start: Optional[date] = None
    recurrence_end: Optional[date] = None

    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: datetime, info) -> datetime:
        start_time = info.data.get('start_time')
        if start_time and v < start_time:
            raise ValueError('end_time must be after start_time')
        return v


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: Optional[bool] = None
    category_id: Optional[UUID] = None
    recurrence_rule: Optional[str] = None
    recurrence_start: Optional[date] = None
    recurrence_end: Optional[date] = None


class MemberInfo(BaseModel):
    name: str
    color: str


class CategoryInfo(BaseModel):
    name: str
    color: str


class EventResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    all_day: bool
    member: MemberInfo
    category: Optional[CategoryInfo]
    is_recurring: bool
    occurrence_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventListResponse(BaseModel):
    events: list[EventResponse]


# ============ Auth ============

class AuthVerifyResponse(BaseModel):
    valid: bool
    member: FamilyMemberResponse
```

**Step 2: Update schemas __init__.py**

Update `app/schemas/__init__.py`:

```python
from app.schemas.calendar import (
    FamilyMemberCreate,
    FamilyMemberUpdate,
    FamilyMemberResponse,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    EventCreate,
    EventUpdate,
    EventResponse,
    EventListResponse,
    AuthVerifyResponse,
)

__all__ = [
    "FamilyMemberCreate",
    "FamilyMemberUpdate",
    "FamilyMemberResponse",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "EventCreate",
    "EventUpdate",
    "EventResponse",
    "EventListResponse",
    "AuthVerifyResponse",
]
```

**Step 3: Verify schemas**

```bash
python -c "from app.schemas import FamilyMemberCreate, EventCreate; print('Schemas loaded')"
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add calendar Pydantic schemas"
```

---

### Task 9: Create Members Router with Tests (TDD)

**Files:**
- Create: `backend-api/tests/integration/test_members.py`
- Create: `backend-api/app/routers/members.py`
- Modify: `backend-api/app/main.py`

**Step 1: Write failing test for GET /members**

Create `tests/integration/test_members.py`:

```python
"""Members API 통합 테스트"""

import pytest
from uuid import uuid4


class TestMembersAPI:
    """Members 엔드포인트 테스트"""

    def test_get_members_returns_empty_list(self, client_with_fake_auth):
        """초기 상태에서 빈 목록 반환"""
        response = client_with_fake_auth.get("/members")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_members_requires_auth(self, client):
        """인증 없이 접근 불가"""
        response = client.get("/members")
        assert response.status_code == 403
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/hklee03-macbook/dev/funq/backend-api
pytest tests/integration/test_members.py -v
```

Expected: FAIL with "404 Not Found" (router not created yet)

**Step 3: Create members router**

Create `app/routers/members.py`:

```python
"""가족 구성원 관리 API"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, FirebaseUser
from app.external.database import get_db
from app.models import FamilyMember
from app.schemas import (
    FamilyMemberCreate,
    FamilyMemberUpdate,
    FamilyMemberResponse,
)

router = APIRouter(prefix="/members", tags=["members"])


def name_to_email(name: str) -> str:
    """이름을 이메일 형식으로 변환"""
    return f"{name}@kidchat.local"


@router.get("", response_model=list[FamilyMemberResponse])
def get_members(
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """가족 구성원 목록 조회"""
    members = db.query(FamilyMember).all()
    return members


@router.post("", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    data: FamilyMemberCreate,
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """가족 구성원 사전 등록"""
    email = name_to_email(data.display_name)

    # 중복 확인
    existing = db.query(FamilyMember).filter(FamilyMember.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 구성원입니다"
        )

    member = FamilyMember(
        email=email,
        display_name=data.display_name,
        color=data.color,
        is_registered=False,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.patch("/{member_id}", response_model=FamilyMemberResponse)
def update_member(
    member_id: UUID,
    data: FamilyMemberUpdate,
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """가족 구성원 정보 수정"""
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="구성원을 찾을 수 없습니다"
        )

    if data.display_name is not None:
        member.display_name = data.display_name
        member.email = name_to_email(data.display_name)
    if data.color is not None:
        member.color = data.color

    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: UUID,
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """가족 구성원 삭제"""
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="구성원을 찾을 수 없습니다"
        )

    db.delete(member)
    db.commit()
```

**Step 4: Register router in main.py**

Update `app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, auth, ai, members

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^http://localhost(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(members.router)


@app.get("/")
def root():
    return {"message": "Backend API is running"}
```

**Step 5: Update routers __init__.py**

Update `app/routers/__init__.py`:

```python
from app.routers import health, auth, ai, members

__all__ = ["health", "auth", "ai", "members"]
```

**Step 6: Run tests**

```bash
pytest tests/integration/test_members.py -v
```

Expected: PASS

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add members API with CRUD endpoints"
```

---

### Task 10: Create Categories Router with Tests (TDD)

**Files:**
- Create: `backend-api/tests/integration/test_categories.py`
- Create: `backend-api/app/routers/categories.py`
- Modify: `backend-api/app/main.py`

**Step 1: Write failing test**

Create `tests/integration/test_categories.py`:

```python
"""Categories API 통합 테스트"""


class TestCategoriesAPI:
    """Categories 엔드포인트 테스트"""

    def test_get_categories_returns_empty_list(self, client_with_fake_auth):
        """초기 상태에서 빈 목록 반환"""
        response = client_with_fake_auth.get("/categories")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_categories_requires_auth(self, client):
        """인증 없이 접근 불가"""
        response = client.get("/categories")
        assert response.status_code == 403
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/integration/test_categories.py -v
```

Expected: FAIL

**Step 3: Create categories router**

Create `app/routers/categories.py`:

```python
"""카테고리 관리 API"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, FirebaseUser
from app.external.database import get_db
from app.models import Category
from app.schemas import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def get_categories(
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """카테고리 목록 조회"""
    categories = db.query(Category).all()
    return categories


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """카테고리 생성"""
    category = Category(
        name=data.name,
        color=data.color,
        icon=data.icon,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: UUID,
    data: CategoryUpdate,
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """카테고리 수정"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="카테고리를 찾을 수 없습니다"
        )

    if data.name is not None:
        category.name = data.name
    if data.color is not None:
        category.color = data.color
    if data.icon is not None:
        category.icon = data.icon

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: UUID,
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """카테고리 삭제"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="카테고리를 찾을 수 없습니다"
        )

    db.delete(category)
    db.commit()
```

**Step 4: Register router in main.py**

Add to `app/main.py`:

```python
from app.routers import health, auth, ai, members, categories
# ...
app.include_router(categories.router)
```

**Step 5: Run tests**

```bash
pytest tests/integration/test_categories.py -v
```

Expected: PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add categories API with CRUD endpoints"
```

---

### Task 11: Create Events Router with Tests (TDD)

**Files:**
- Create: `backend-api/tests/integration/test_events.py`
- Create: `backend-api/app/routers/events.py`
- Modify: `backend-api/app/main.py`

**Step 1: Write failing test**

Create `tests/integration/test_events.py`:

```python
"""Events API 통합 테스트"""

from datetime import datetime, timedelta


class TestEventsAPI:
    """Events 엔드포인트 테스트"""

    def test_get_events_returns_empty_list(self, client_with_fake_auth):
        """초기 상태에서 빈 목록 반환"""
        today = datetime.now().date()
        response = client_with_fake_auth.get(
            "/events",
            params={
                "start_date": str(today),
                "end_date": str(today + timedelta(days=30))
            }
        )
        assert response.status_code == 200
        assert response.json()["events"] == []

    def test_get_events_requires_auth(self, client):
        """인증 없이 접근 불가"""
        response = client.get("/events")
        assert response.status_code == 403
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/integration/test_events.py -v
```

Expected: FAIL

**Step 3: Create events router**

Create `app/routers/events.py`:

```python
"""일정 관리 API"""

from datetime import date, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, FirebaseUser
from app.external.database import get_db
from app.models import Event, FamilyMember, Category
from app.schemas import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventListResponse,
    MemberInfo,
    CategoryInfo,
)

router = APIRouter(prefix="/events", tags=["events"])


def get_member_by_firebase_uid(db: Session, firebase_uid: str) -> FamilyMember:
    """Firebase UID로 가족 구성원 조회"""
    member = db.query(FamilyMember).filter(
        FamilyMember.firebase_uid == firebase_uid
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="등록되지 않은 가족입니다"
        )
    return member


def event_to_response(event: Event, occurrence_date: date = None) -> EventResponse:
    """Event 모델을 응답 스키마로 변환"""
    return EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        start_time=event.start_time,
        end_time=event.end_time,
        all_day=event.all_day,
        member=MemberInfo(
            name=event.creator.display_name,
            color=event.creator.color,
        ),
        category=CategoryInfo(
            name=event.category.name,
            color=event.category.color,
        ) if event.category else None,
        is_recurring=event.recurrence_rule is not None,
        occurrence_date=occurrence_date,
        created_at=event.created_at,
        updated_at=event.updated_at,
    )


@router.get("", response_model=EventListResponse)
def get_events(
    start_date: date = Query(..., description="조회 시작일"),
    end_date: date = Query(..., description="조회 종료일"),
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """일정 목록 조회 (기간 내)"""
    # TODO: 반복 일정 전개 로직 추가
    events = db.query(Event).filter(
        Event.start_time >= datetime.combine(start_date, datetime.min.time()),
        Event.start_time <= datetime.combine(end_date, datetime.max.time()),
    ).all()

    return EventListResponse(
        events=[event_to_response(e) for e in events]
    )


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventCreate,
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """일정 생성"""
    member = get_member_by_firebase_uid(db, user.uid)

    event = Event(
        title=data.title,
        description=data.description,
        start_time=data.start_time,
        end_time=data.end_time,
        all_day=data.all_day,
        category_id=data.category_id,
        created_by=member.id,
        recurrence_rule=data.recurrence_rule,
        recurrence_start=data.recurrence_start,
        recurrence_end=data.recurrence_end,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event_to_response(event)


@router.patch("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: UUID,
    data: EventUpdate,
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """일정 수정"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="일정을 찾을 수 없습니다"
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event_to_response(event)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: UUID,
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """일정 삭제"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="일정을 찾을 수 없습니다"
        )

    db.delete(event)
    db.commit()
```

**Step 4: Register router in main.py**

Add to `app/main.py`:

```python
from app.routers import health, auth, ai, members, categories, events
# ...
app.include_router(events.router)
```

**Step 5: Run tests**

```bash
pytest tests/integration/test_events.py -v
```

Expected: PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add events API with CRUD endpoints"
```

---

### Task 12: Add Auth Verify Endpoint for Calendar

**Files:**
- Modify: `backend-api/app/routers/auth.py`
- Create: `backend-api/tests/integration/test_calendar_auth.py`

**Step 1: Write failing test**

Create `tests/integration/test_calendar_auth.py`:

```python
"""Calendar Auth 통합 테스트"""


class TestCalendarAuth:
    """캘린더 인증 테스트"""

    def test_verify_returns_member_info(self, client_with_fake_auth):
        """인증 성공 시 가족 구성원 정보 반환"""
        # TODO: member 생성 후 테스트
        response = client_with_fake_auth.get("/auth/calendar/verify")
        # 등록되지 않은 경우 403
        assert response.status_code == 403
```

**Step 2: Add calendar verify endpoint**

Update `app/routers/auth.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, FirebaseUser
from app.external.database import get_db
from app.models import FamilyMember
from app.schemas import AuthVerifyResponse, FamilyMemberResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
def get_me(user: FirebaseUser = Depends(get_current_user)):
    """현재 인증된 사용자 정보 반환"""
    return {
        "uid": user.uid,
        "email": user.email,
        "name": user.name,
    }


@router.get("/verify")
def verify_token(user: FirebaseUser = Depends(get_current_user)):
    """토큰 유효성 확인"""
    return {"valid": True, "uid": user.uid}


@router.get("/calendar/verify", response_model=AuthVerifyResponse)
def verify_calendar_member(
    user: FirebaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """캘린더 가족 구성원 확인 및 연결"""
    # 이메일로 사전 등록된 구성원 찾기
    member = db.query(FamilyMember).filter(
        FamilyMember.email == user.email
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="등록되지 않은 가족입니다. 관리자에게 문의하세요."
        )

    # Firebase UID 연결 (첫 로그인 시)
    if not member.firebase_uid:
        member.firebase_uid = user.uid
        member.is_registered = True
        db.commit()
        db.refresh(member)

    return AuthVerifyResponse(
        valid=True,
        member=FamilyMemberResponse.model_validate(member)
    )
```

**Step 3: Run tests**

```bash
pytest tests/integration/test_calendar_auth.py -v
```

Expected: PASS

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add calendar auth verify endpoint"
```

---

## Phase 3: Calendar UI

### Task 13: Create API Client

**Files:**
- Create: `calendar/src/lib/api.ts`

**Step 1: Create API client**

Create `src/lib/api.ts`:

```typescript
import { getIdToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getIdToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Auth
export async function verifyCalendarMember() {
  return fetchWithAuth('/auth/calendar/verify');
}

// Members
export async function getMembers() {
  return fetchWithAuth('/members');
}

export async function createMember(data: { display_name: string; color: string }) {
  return fetchWithAuth('/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMember(id: string, data: { display_name?: string; color?: string }) {
  return fetchWithAuth(`/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteMember(id: string) {
  return fetchWithAuth(`/members/${id}`, { method: 'DELETE' });
}

// Categories
export async function getCategories() {
  return fetchWithAuth('/categories');
}

export async function createCategory(data: { name: string; color: string; icon?: string }) {
  return fetchWithAuth('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: { name?: string; color?: string; icon?: string }) {
  return fetchWithAuth(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  return fetchWithAuth(`/categories/${id}`, { method: 'DELETE' });
}

// Events
export async function getEvents(startDate: string, endDate: string) {
  return fetchWithAuth(`/events?start_date=${startDate}&end_date=${endDate}`);
}

export async function createEvent(data: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  category_id?: string;
  recurrence_rule?: string;
  recurrence_start?: string;
  recurrence_end?: string;
}) {
  return fetchWithAuth('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id: string, data: Partial<{
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  category_id: string;
}>) {
  return fetchWithAuth(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string) {
  return fetchWithAuth(`/events/${id}`, { method: 'DELETE' });
}
```

**Step 2: Commit**

```bash
cd /Users/hklee03-macbook/dev/funq/calendar
git add .
git commit -m "feat: add API client for backend communication"
```

---

### Task 14: Create Calendar Header Component

**Files:**
- Create: `calendar/src/components/calendar/CalendarHeader.tsx`

**Step 1: Create header component**

Create `src/components/calendar/CalendarHeader.tsx`:

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ViewType = 'month' | 'week' | 'day';

interface CalendarHeaderProps {
  currentDate: Date;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onAddEvent: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onAddEvent,
}: CalendarHeaderProps) {
  const formatTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (view === 'month') {
      return `${year}년 ${month}월`;
    }

    if (view === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${year}년 ${month}월 ${weekStart.getDate()}일 - ${weekEnd.getDate()}일`;
      }
      return `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 - ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;
    }

    return `${year}년 ${month}월 ${currentDate.getDate()}일`;
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => onNavigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onNavigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => onNavigate('today')}>
          오늘
        </Button>
        <h2 className="text-xl font-semibold">{formatTitle()}</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex border rounded-md">
          {(['month', 'week', 'day'] as ViewType[]).map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange(v)}
              className="rounded-none first:rounded-l-md last:rounded-r-md"
            >
              {v === 'month' ? '월' : v === 'week' ? '주' : '일'}
            </Button>
          ))}
        </div>
        <Button onClick={onAddEvent}>+ 일정 추가</Button>
      </div>
    </div>
  );
}
```

**Step 2: Install lucide-react**

```bash
npm install lucide-react
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add CalendarHeader component"
```

---

### Task 15: Create Month View Component

**Files:**
- Create: `calendar/src/components/calendar/MonthView.tsx`
- Create: `calendar/src/components/calendar/EventCard.tsx`

**Step 1: Create EventCard component**

Create `src/components/calendar/EventCard.tsx`:

```typescript
interface EventCardProps {
  title: string;
  time?: string;
  memberColor: string;
  categoryColor?: string;
  memberName: string;
  onClick?: () => void;
}

export function EventCard({
  title,
  time,
  memberColor,
  categoryColor,
  memberName,
  onClick,
}: EventCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-1 p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: `${memberColor}15`,
      }}
    >
      {categoryColor && (
        <span
          className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{title}</p>
        {time && <p className="text-muted-foreground">{time}</p>}
        <p className="text-muted-foreground truncate">{memberName}</p>
      </div>
    </div>
  );
}
```

**Step 2: Create MonthView component**

Create `src/components/calendar/MonthView.tsx`:

```typescript
'use client';

import { EventCard } from './EventCard';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  member: { name: string; color: string };
  category?: { name: string; color: string };
}

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
}: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  const current = new Date(startDate);

  while (current <= lastDay || currentWeek.length > 0) {
    currentWeek.push(new Date(current));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
      if (current > lastDay) break;
    }
    current.setDate(current.getDate() + 1);
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => {
      const eventDate = new Date(event.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-7 border-b">
        {weekdays.map((day, i) => (
          <div
            key={day}
            className={`p-2 text-center text-sm font-medium ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {weeks.flat().map((date, i) => {
          const dayEvents = getEventsForDate(date);
          const displayEvents = dayEvents.slice(0, 3);
          const moreCount = dayEvents.length - 3;

          return (
            <div
              key={i}
              onClick={() => onDateClick(date)}
              className={`border-b border-r p-1 min-h-[100px] cursor-pointer hover:bg-muted/50 ${
                !isCurrentMonth(date) ? 'bg-muted/30 text-muted-foreground' : ''
              }`}
            >
              <div
                className={`text-sm mb-1 ${
                  isToday(date)
                    ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center'
                    : ''
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {displayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    title={event.title}
                    time={!event.all_day ? formatTime(event.start_time) : undefined}
                    memberColor={event.member.color}
                    categoryColor={event.category?.color}
                    memberName={event.member.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  />
                ))}
                {moreCount > 0 && (
                  <p className="text-xs text-muted-foreground">+{moreCount} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add MonthView and EventCard components"
```

---

### Task 16: Create Week and Day View Components

**Files:**
- Create: `calendar/src/components/calendar/WeekView.tsx`
- Create: `calendar/src/components/calendar/DayView.tsx`

**Step 1: Create WeekView component**

Create `src/components/calendar/WeekView.tsx`:

```typescript
'use client';

import { EventCard } from './EventCard';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  member: { name: string; color: string };
  category?: { name: string; color: string };
}

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}: WeekViewProps) {
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      const eventHour = eventDate.getHours();
      return eventDateStr === dateStr && eventHour === hour;
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="grid grid-cols-8 border-b">
        <div className="p-2" />
        {days.map((date, i) => (
          <div
            key={i}
            className={`p-2 text-center border-l ${
              isToday(date) ? 'bg-primary/10' : ''
            }`}
          >
            <div className={`text-sm ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}`}>
              {weekdays[i]}
            </div>
            <div className={`text-lg ${isToday(date) ? 'font-bold' : ''}`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8">
          {hours.map((hour) => (
            <>
              <div key={`hour-${hour}`} className="p-2 text-right text-sm text-muted-foreground border-b">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((date, dayIndex) => {
                const hourEvents = getEventsForDateAndHour(date, hour);
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    onClick={() => onTimeSlotClick(date, hour)}
                    className="border-l border-b min-h-[60px] p-1 cursor-pointer hover:bg-muted/50"
                  >
                    {hourEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        title={event.title}
                        time={formatTime(event.start_time)}
                        memberColor={event.member.color}
                        categoryColor={event.category?.color}
                        memberName={event.member.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create DayView component**

Create `src/components/calendar/DayView.tsx`:

```typescript
'use client';

import { EventCard } from './EventCard';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  member: { name: string; color: string };
  category?: { name: string; color: string };
}

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function DayView({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      const eventHour = eventDate.getHours();
      return eventDateStr === dateStr && eventHour === hour;
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b text-center">
        <div className="text-lg font-semibold">
          {currentDate.getMonth() + 1}월 {currentDate.getDate()}일 ({weekdays[currentDate.getDay()]})
        </div>
        {isToday() && (
          <div className="text-sm text-primary">오늘</div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[80px_1fr]">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            return (
              <>
                <div key={`hour-${hour}`} className="p-2 text-right text-sm text-muted-foreground border-b">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div
                  key={`slot-${hour}`}
                  onClick={() => onTimeSlotClick(currentDate, hour)}
                  className="border-l border-b min-h-[60px] p-2 cursor-pointer hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    {hourEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        title={event.title}
                        time={`${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
                        memberColor={event.member.color}
                        categoryColor={event.category?.color}
                        memberName={event.member.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add WeekView and DayView components"
```

---

### Task 17: Create Event Dialog Component

**Files:**
- Create: `calendar/src/components/event/EventDialog.tsx`

**Step 1: Install additional shadcn components**

```bash
npx shadcn@latest add textarea switch
```

**Step 2: Create EventDialog component**

Create `src/components/event/EventDialog.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  all_day: boolean;
  category_id: string;
}

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => void;
  onDelete?: () => void;
  categories: Category[];
  initialData?: Partial<EventFormData>;
  isEditing?: boolean;
}

export function EventDialog({
  open,
  onClose,
  onSave,
  onDelete,
  categories,
  initialData,
  isEditing = false,
}: EventDialogProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_date: new Date().toISOString().split('T')[0],
    end_time: '10:00',
    all_day: false,
    category_id: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '일정 수정' : '일정 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="일정 제목"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="all_day"
              checked={formData.all_day}
              onCheckedChange={(checked) => setFormData({ ...formData, all_day: checked })}
            />
            <Label htmlFor="all_day">하루 종일</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>시작</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
              {!formData.all_day && (
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>종료</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
              {!formData.all_day && (
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="일정에 대한 설명"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            {isEditing && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                삭제
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add EventDialog component for creating/editing events"
```

---

### Task 18: Integrate Calendar Components in Main Page

**Files:**
- Modify: `calendar/src/app/page.tsx`
- Create: `calendar/src/hooks/useEvents.ts`

**Step 1: Create useEvents hook**

Create `src/hooks/useEvents.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEvents, getCategories, createEvent, updateEvent, deleteEvent } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  member: { name: string; color: string };
  category?: { name: string; color: string };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export function useEvents(startDate: Date, endDate: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      const data = await getEvents(startStr, endStr);
      setEvents(data.events);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [fetchEvents, fetchCategories]);

  const addEvent = async (eventData: Parameters<typeof createEvent>[0]) => {
    const newEvent = await createEvent(eventData);
    await fetchEvents();
    return newEvent;
  };

  const editEvent = async (id: string, eventData: Parameters<typeof updateEvent>[1]) => {
    const updated = await updateEvent(id, eventData);
    await fetchEvents();
    return updated;
  };

  const removeEvent = async (id: string) => {
    await deleteEvent(id);
    await fetchEvents();
  };

  return {
    events,
    categories,
    loading,
    error,
    addEvent,
    editEvent,
    removeEvent,
    refresh: fetchEvents,
  };
}
```

**Step 2: Update main page**

Update `src/app/page.tsx`:

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { verifyCalendarMember } from '@/lib/api';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { EventDialog } from '@/components/event/EventDialog';

type ViewType = 'month' | 'week' | 'day';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [memberVerified, setMemberVerified] = useState(false);

  const dateRange = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    start.setDate(start.getDate() - 7);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }, [currentDate]);

  const { events, categories, loading, addEvent, editEvent, removeEvent } = useEvents(
    dateRange.start,
    dateRange.end
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !memberVerified) {
      verifyCalendarMember()
        .then(() => setMemberVerified(true))
        .catch(() => {
          alert('등록되지 않은 가족입니다. 관리자에게 문의하세요.');
          logout();
          router.push('/login');
        });
    }
  }, [user, memberVerified, logout, router]);

  if (authLoading || !user || !memberVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);

    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const delta = direction === 'prev' ? -1 : 1;

    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + delta);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + delta * 7);
    } else {
      newDate.setDate(newDate.getDate() + delta);
    }

    setCurrentDate(newDate);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedEvent({
      start_date: date.toISOString().split('T')[0],
      end_date: date.toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    setSelectedEvent({
      start_date: date.toISOString().split('T')[0],
      end_date: date.toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
    });
    setDialogOpen(true);
  };

  const handleSaveEvent = async (formData: any) => {
    const startTime = formData.all_day
      ? `${formData.start_date}T00:00:00`
      : `${formData.start_date}T${formData.start_time}:00`;
    const endTime = formData.all_day
      ? `${formData.end_date}T23:59:59`
      : `${formData.end_date}T${formData.end_time}:00`;

    const eventData = {
      title: formData.title,
      description: formData.description || undefined,
      start_time: startTime,
      end_time: endTime,
      all_day: formData.all_day,
      category_id: formData.category_id || undefined,
    };

    try {
      if (selectedEvent?.id) {
        await editEvent(selectedEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }
      setDialogOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save event');
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent?.id) {
      try {
        await removeEvent(selectedEvent.id);
        setDialogOpen(false);
        setSelectedEvent(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete event');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
        onAddEvent={() => {
          setSelectedEvent(null);
          setDialogOpen(true);
        }}
      />

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      )}

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onTimeSlotClick={handleTimeSlotClick}
        />
      )}

      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onTimeSlotClick={handleTimeSlotClick}
        />
      )}

      <EventDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={selectedEvent?.id ? handleDeleteEvent : undefined}
        categories={categories}
        initialData={selectedEvent}
        isEditing={!!selectedEvent?.id}
      />
    </div>
  );
}
```

**Step 3: Run and verify**

```bash
npm run dev
```

Navigate to http://localhost:3000 and verify the calendar renders.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: integrate calendar components in main page"
```

---

## Summary

This plan covers:
- **Phase 1 (Tasks 1-5):** Frontend foundation with Next.js, shadcn/ui, Firebase auth
- **Phase 2 (Tasks 6-12):** Backend API with FastAPI, PostgreSQL models, CRUD endpoints
- **Phase 3 (Tasks 13-18):** Calendar UI with month/week/day views and event management

**Remaining for Phase 4 (not included in this plan):**
- Recurrence form UI
- Recurrence exception handling
- Settings pages for members/categories management
- RRULE expansion logic in backend
