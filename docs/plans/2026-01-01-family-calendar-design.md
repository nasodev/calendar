# 가족 공유 캘린더 설계 문서

## 1. 개요

**목적**: 확대가족(5-8명)이 일정을 공유하는 웹 캘린더

**핵심 특징**:
- 구성원별 색상 + 카테고리별 색상 조합
- 월간/주간/일간 뷰 전환
- 상세 반복 일정 (매주 월·수·금, 매월 셋째 토요일 등)
- Firebase Auth 공유 (kid-chat과 동일 계정)
- 권한: 모든 가족 구성원이 동등 (생성/수정/삭제 가능)
- 알림: 없음

## 2. 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Next.js App    │────▶│  FastAPI        │────▶│  PostgreSQL  │
│  (calendar)     │     │  (backend-api)  │     │              │
└────────┬────────┘     └─────────────────┘     └──────────────┘
         │
         ▼
┌─────────────────┐
│  Firebase Auth  │ ◀── kid-chat과 공유
└─────────────────┘
```

## 3. 데이터 모델

### 3.1 family_members (가족 구성원)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| firebase_uid | VARCHAR | Firebase Auth UID (UNIQUE) |
| email | VARCHAR | 이메일 - {name}@kidchat.local 형식 (UNIQUE) |
| display_name | VARCHAR | 표시 이름 |
| color | VARCHAR | 구성원 고유 색상 (#FF5733) |
| is_registered | BOOLEAN | 사전등록(false) vs 실제가입(true) |
| created_at | TIMESTAMP | 생성일시 |

### 3.2 categories (카테고리)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| name | VARCHAR | 카테고리명 (병원, 학교, 가족행사 등) |
| color | VARCHAR | 카테고리 색상 (#4CAF50) |
| icon | VARCHAR | 선택적 아이콘 |

### 3.3 events (일정)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| title | VARCHAR | 일정 제목 |
| description | TEXT | 일정 설명 |
| start_time | TIMESTAMP | 시작 시간 |
| end_time | TIMESTAMP | 종료 시간 |
| all_day | BOOLEAN | 하루종일 여부 |
| category_id | UUID | 카테고리 FK |
| created_by | UUID | 작성자 FK |
| recurrence_rule | VARCHAR | RRULE 형식 (RFC 5545) |
| recurrence_start | DATE | 반복 시작일 |
| recurrence_end | DATE | 반복 종료일 (NULL이면 무한) |
| created_at | TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | 수정일시 |

### 3.4 recurrence_exceptions (반복 예외)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| event_id | UUID | 일정 FK |
| original_date | DATE | 원래 날짜 |
| is_deleted | BOOLEAN | 해당 날짜 삭제 여부 |
| modified_event | JSONB | 해당 날짜만 다른 내용 |

### 3.5 반복 규칙 예시 (RRULE)

| 패턴 | recurrence_rule | recurrence_start | recurrence_end |
|------|-----------------|------------------|----------------|
| 매주 월·수·금 (6개월) | `FREQ=WEEKLY;BYDAY=MO,WE,FR` | 2025-01-01 | 2025-06-30 |
| 매월 셋째 토요일 (무기한) | `FREQ=MONTHLY;BYDAY=3SA` | 2025-01-01 | NULL |
| 매일 (1년) | `FREQ=DAILY` | 2025-01-01 | 2025-12-31 |

## 4. API 설계

### 4.1 인증

```
POST /auth/verify    Firebase 토큰 검증 → 가족 구성원 확인
```

### 4.2 가족 구성원 관리

```
GET    /members            가족 구성원 목록 (색상 포함)
POST   /members            구성원 사전 등록 (이름 + 색상)
PATCH  /members/{id}       구성원 정보 수정 (이름, 색상)
DELETE /members/{id}       구성원 삭제
```

### 4.3 카테고리 관리

```
GET    /categories         카테고리 목록
POST   /categories         카테고리 생성
PATCH  /categories/{id}    카테고리 수정
DELETE /categories/{id}    카테고리 삭제
```

### 4.4 일정 관리

```
GET    /events                          일정 조회 (쿼리: start_date, end_date)
POST   /events                          일정 생성 (반복 포함)
PATCH  /events/{id}                     일정 수정
DELETE /events/{id}                     일정 삭제
PATCH  /events/{id}/occurrence/{date}   특정 날짜만 수정
DELETE /events/{id}/occurrence/{date}   특정 날짜만 삭제
```

### 4.5 일정 조회 응답 예시

```json
{
  "events": [
    {
      "id": "uuid",
      "title": "학원",
      "start_time": "2025-01-06T14:00:00",
      "end_time": "2025-01-06T16:00:00",
      "member": { "name": "민수", "color": "#FF5733" },
      "category": { "name": "학교", "color": "#4CAF50" },
      "is_recurring": true,
      "occurrence_date": "2025-01-06"
    }
  ]
}
```

## 5. 프론트엔드 구조

### 5.1 디렉토리 구조

```
calendar/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 루트 레이아웃
│   │   ├── page.tsx                # 메인 캘린더 페이지
│   │   ├── login/page.tsx          # 로그인
│   │   └── settings/
│   │       ├── members/page.tsx    # 구성원 관리
│   │       └── categories/page.tsx # 카테고리 관리
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── CalendarHeader.tsx  # 월/주/일 전환, 네비게이션
│   │   │   ├── MonthView.tsx       # 월간 뷰
│   │   │   ├── WeekView.tsx        # 주간 뷰
│   │   │   ├── DayView.tsx         # 일간 뷰
│   │   │   └── EventCard.tsx       # 일정 카드 (색상 표시)
│   │   ├── event/
│   │   │   ├── EventDialog.tsx     # 일정 생성/수정 다이얼로그
│   │   │   └── RecurrenceForm.tsx  # 반복 설정 폼
│   │   └── ui/                     # shadcn 컴포넌트
│   ├── lib/
│   │   ├── firebase.ts             # Firebase 초기화
│   │   ├── api.ts                  # API 클라이언트
│   │   └── recurrence.ts           # RRULE 파싱/생성 유틸
│   └── hooks/
│       ├── useAuth.ts              # Firebase 인증 훅
│       └── useEvents.ts            # 일정 데이터 훅
```

### 5.2 주요 shadcn 컴포넌트

- `Dialog` - 일정 생성/수정
- `Select` - 카테고리, 반복 유형 선택
- `Calendar` - 날짜 선택
- `Button`, `Input`, `Popover` 등

### 5.3 디자인 참조

- 기본 UI/UX: https://calendar-shadcn.vercel.app/
- 추가 요소: 구성원/카테고리 색상 표시

### 5.4 일정 카드 색상 표시

- 좌측 점(●): 카테고리 색상
- 배경 틴트: 구성원 색상 (10% opacity)
- 하단 텍스트: 작성자 이름

## 6. 인증 플로우

### 6.1 로그인 방식

이름 + 비밀번호 (kid-chat과 동일)
- 이름을 `{name}@kidchat.local` 형식으로 변환
- Firebase `signInWithEmailAndPassword` 사용

### 6.2 가족 연결 플로우

```
1. 관리자가 가족 이름 사전 등록
   POST /members { name: "나윤", color: "#E91E63" }
   → family_members 생성 (email: "나윤@kidchat.local", is_registered: false)

2. 가족 구성원이 kid-chat에서 회원가입 (또는 이미 가입됨)
   → Firebase Auth에 "나윤@kidchat.local" 계정 생성

3. 캘린더 앱 로그인
   - 이름/비밀번호 입력 → Firebase signInWithEmailAndPassword
   - 로그인 성공 후 /auth/verify 호출
   - family_members에 이름 있으면 → 접근 허용
   - 없으면 → "등록되지 않은 가족입니다"
```

## 7. 에러 처리

### 7.1 인증 에러

| 상황 | 처리 |
|------|------|
| 잘못된 이름/비밀번호 | "이름 또는 비밀번호가 틀렸습니다" |
| 등록되지 않은 가족 | "등록되지 않은 가족입니다. 관리자에게 문의하세요" |
| Firebase 토큰 만료 | 자동 갱신, 실패 시 재로그인 유도 |

### 7.2 일정 관련 에러

| 상황 | 처리 |
|------|------|
| 종료 시간 < 시작 시간 | "종료 시간은 시작 시간 이후여야 합니다" |
| 반복 종료일 < 시작일 | "반복 종료일은 시작일 이후여야 합니다" |
| 필수 필드 누락 | 해당 필드 하이라이트 + 메시지 |

### 7.3 동시 수정 처리

- 낙관적 업데이트 (UI 즉시 반영)
- 서버 응답 실패 시 롤백 + 토스트 알림
- 새로고침 시 최신 데이터 동기화

## 8. 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 16.1.1 (App Router) |
| UI 컴포넌트 | shadcn/ui + Tailwind CSS |
| 디자인 참조 | https://calendar-shadcn.vercel.app/ |
| 인증 | Firebase Auth (kid-chat 공유) |
| Backend | FastAPI (기존 backend-api 확장) |
| Database | PostgreSQL + SQLAlchemy |
| 반복 일정 | RRULE (RFC 5545) |

## 9. 구현 순서

### Phase 1: 기반 구축
- Next.js 16.1.1 프로젝트 초기화 + shadcn 설정
- Firebase 연동 (kid-chat config 공유)
- 로그인 페이지

### Phase 2: 백엔드 API
- family_members, categories, events 테이블 생성
- CRUD API 엔드포인트
- 반복 일정 전개 로직

### Phase 3: 캘린더 UI
- calendar-shadcn 디자인 적용 (월간/주간/일간 뷰)
- 구성원/카테고리 색상 표시 추가
- 일정 생성/수정 다이얼로그

### Phase 4: 고급 기능
- 반복 일정 설정 UI
- 반복 예외 처리 (특정 날짜 수정/삭제)
- 설정 페이지 (구성원/카테고리 관리)
