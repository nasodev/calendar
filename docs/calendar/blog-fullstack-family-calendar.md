# 가족 캘린더 풀스택 개발기: FastAPI + Next.js로 반복 일정까지 구현하기

## 들어가며

아이들 학원 스케줄, 가족 약속, 기념일... 가족 구성원마다 일정이 다르고, 서로의 일정을 파악하기 어려웠다. Google 캘린더를 쓸 수도 있지만, 직접 만들어보고 싶었다. 특히 "매주 월, 수, 금 학원" 같은 반복 일정을 어떻게 처리하는지 궁금했다.

이 글에서는 **FastAPI 백엔드**와 **Next.js 프론트엔드**로 가족 캘린더를 구축한 전체 과정을 공유한다.

![가족 캘린더 메인 화면](./images/calendar-main.png)

---

## 기술 스택

### 백엔드
```
Python 3.13 + FastAPI 0.115
PostgreSQL + SQLAlchemy 2.0
Firebase Authentication
python-dateutil (반복 일정)
pytest (TDD)
```

### 프론트엔드
```
Next.js 16.1.1 + React 19
TypeScript 5 (Strict Mode)
Tailwind CSS 4
shadcn/ui + Radix UI
Firebase SDK 12.7
date-fns 4.1 (한국어 로케일)
```

풀스택 인증은 **Firebase**로 통일했다. 프론트엔드에서 Firebase로 로그인하면 ID Token을 발급받고, 백엔드는 이 토큰을 검증하여 사용자를 식별한다.

---

## 풀스택 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Next.js    │  │  shadcn/ui   │  │     Firebase Auth      │ │
│  │  App Router │  │  Components  │  │  (로그인 + ID Token)   │ │
│  └──────┬──────┘  └──────────────┘  └───────────┬────────────┘ │
│         │                                        │              │
│         │         API Client (Bearer Token)      │              │
│         └───────────────────┬────────────────────┘              │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────┼───────────────────────────────────┐
│                         Backend                                  │
│                              │                                   │
│  ┌───────────────────────────┴────────────────────────────────┐ │
│  │                      FastAPI                                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │ │
│  │  │  Auth    │  │ Members  │  │Categories│  │   Events   │  │ │
│  │  │  Router  │  │  Router  │  │  Router  │  │   Router   │  │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │ │
│  │       │             │             │              │         │ │
│  │       └─────────────┴──────┬──────┴──────────────┘         │ │
│  │                            │                               │ │
│  │  ┌─────────────────────────┴─────────────────────────────┐ │ │
│  │  │              Service Layer (Protocol 기반)            │ │ │
│  │  │   MemberService │ CategoryService │ EventService      │ │ │
│  │  └─────────────────────────┬─────────────────────────────┘ │ │
│  │                            │                               │ │
│  │  ┌─────────────────────────┴─────────────────────────────┐ │ │
│  │  │           PostgreSQL + SQLAlchemy ORM                 │ │ │
│  │  │   FamilyMember │ Category │ Event │ RecurrenceException│ │ │
│  │  └───────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: 백엔드 구현

### Protocol 패턴으로 테스트 용이성 확보

Python의 `Protocol`을 사용해 인터페이스를 정의하고, 실제 서비스와 Fake 구현체를 분리했다.

```python
# protocol.py
class MemberServiceProtocol(Protocol):
    def get_all(self) -> list[FamilyMemberResponse]: ...
    def create(self, data: FamilyMemberCreate) -> FamilyMemberResponse: ...
    def verify_and_link(self, email: str, firebase_uid: str) -> FamilyMemberResponse: ...
```

이 패턴 덕분에 **PostgreSQL 없이도 92개의 테스트**를 0.12초 만에 실행할 수 있다.

### 반복 일정 핵심: RRULE

RRULE(Recurrence Rule)은 iCalendar 표준(RFC 5545)에서 정의한 반복 규칙 형식이다.

```
FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR
```

이 규칙은 "매주 월, 수, 금 반복"을 의미한다. 사용자 친화적인 API를 위해 **패턴 객체 방식**도 지원한다.

```json
{
  "title": "학원",
  "start_time": "2024-01-15T16:00:00",
  "end_time": "2024-01-15T18:00:00",
  "recurrence_pattern": {
    "frequency": "WEEKLY",
    "weekdays": ["MO", "WE", "FR"]
  },
  "recurrence_end": "2024-12-31"
}
```

### 반복 일정 확장

일정 조회 시, 반복 일정은 해당 기간 내 발생하는 모든 날짜로 **확장**된다.

```python
def get_by_date_range(self, start_date: date, end_date: date):
    results = []

    # 1. 일반 일정 조회
    non_recurring = self.db.query(Event).filter(
        Event.recurrence_rule.is_(None),
        Event.start_time.between(start_date, end_date),
    ).all()

    # 2. 반복 일정 확장
    recurring = self.db.query(Event).filter(
        Event.recurrence_rule.isnot(None),
        Event.start_time <= end_date,
    ).all()

    for event in recurring:
        occurrences = get_occurrences(
            rrule_str=event.recurrence_rule,
            dtstart=event.start_time,
            range_start=start_date,
            range_end=end_date,
        )
        for occurrence_date in occurrences:
            results.append(self._event_to_response(event, occurrence_date))

    return results
```

---

## Part 2: 프론트엔드 구현

### 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx          # 메인 캘린더 (인증 필요)
│   └── login/page.tsx    # 로그인 페이지
├── components/
│   ├── calendar/         # 캘린더 컴포넌트
│   │   ├── CalendarHeader.tsx   # 뷰 전환 + 네비게이션
│   │   ├── MonthView.tsx        # 월간 그리드
│   │   ├── WeekView.tsx         # 주간 타임라인
│   │   ├── DayView.tsx          # 일간 상세
│   │   ├── EventDialog.tsx      # 일정 생성/수정
│   │   └── CategoryDialog.tsx   # 카테고리 관리
│   └── ui/               # shadcn/ui 컴포넌트
├── lib/
│   ├── api.ts            # API 클라이언트
│   ├── auth.ts           # Firebase 인증 함수
│   └── firebase.ts       # Firebase 초기화
└── hooks/
    └── useAuth.ts        # 인증 상태 관리 훅
```

### API 클라이언트: Bearer Token 자동 주입

모든 API 요청에 Firebase ID Token을 자동으로 추가한다.

```typescript
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

  return response.json();
}
```

### 멀티 뷰 캘린더

세 가지 뷰를 제공한다.

| 뷰 | 용도 | 특징 |
|----|------|------|
| **월간** | 전체 일정 파악 | 반응형 이벤트 표시 (1~3개) |
| **주간** | 시간대별 확인 | 24시간 타임라인 |
| **일간** | 상세 일정 관리 | 시간 슬롯 클릭 생성 |

```typescript
{view === 'month' && <MonthView currentDate={currentDate} events={events} />}
{view === 'week' && <WeekView currentDate={currentDate} events={events} />}
{view === 'day' && <DayView currentDate={currentDate} events={events} />}
```

### 반복 일정 UI

```typescript
type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

interface RecurrencePattern {
  frequency: Frequency;
  interval?: number;
  weekdays?: Weekday[];
}
```

주간 반복 선택 시 요일 버튼이 나타난다.

```typescript
{frequency === 'WEEKLY' && (
  <div className="flex flex-wrap gap-1">
    {WEEKDAY_OPTIONS.map((opt) => (
      <Button
        key={opt.value}
        variant={weekdays.includes(opt.value) ? 'default' : 'outline'}
        size="sm"
        className="w-9 h-9 p-0"
        onClick={() => toggleWeekday(opt.value)}
      >
        {opt.label}
      </Button>
    ))}
  </div>
)}
```

![반복 일정 설정 UI](./images/recurrence-ui.png)

### 반응형 디자인

같은 데이터를 화면 크기에 따라 다르게 렌더링한다.

```typescript
// 화면 크기별 표시 개수
const mobileCount = 1;
const tabletCount = 2;
const desktopCount = 3;

// 모바일: 1개만 표시
<div className="md:hidden">
  {dayEvents.slice(0, mobileCount).map(renderEvent)}
  {dayEvents.length > mobileCount && (
    <p className="text-xs">+{dayEvents.length - mobileCount}</p>
  )}
</div>

// 태블릿: 2개
<div className="hidden md:block lg:hidden">
  {dayEvents.slice(0, tabletCount).map(renderEvent)}
</div>

// 데스크톱: 3개
<div className="hidden lg:block">
  {dayEvents.slice(0, desktopCount).map(renderEvent)}
</div>
```

---

## Part 3: 풀스택 삽질기

### 삽질 1: 타임존 지옥

**증상**: 1월 3일 일정이 1월 4일에 표시됨

**원인**: `toISOString()`이 UTC로 변환하면서 날짜가 밀림

```typescript
// 문제 코드
const dateStr = date.toISOString().split('T')[0];
// 1월 3일 00:00 KST → "2026-01-02" (UTC 기준)
```

**해결**: 로컬 Date 메서드 사용

```typescript
// 해결 코드
const getEventsForDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  return events.filter((event) => {
    // 반복 일정은 occurrence_date 사용
    if (event.is_recurring && event.occurrence_date) {
      const [y, m, d] = event.occurrence_date.split('-').map(Number);
      return y === year && m - 1 === month && d === day;
    }
    // 일반 일정은 start_time 파싱
    const eventDate = new Date(event.start_time);
    return (
      eventDate.getFullYear() === year &&
      eventDate.getMonth() === month &&
      eventDate.getDate() === day
    );
  });
};
```

### 삽질 2: 첫 로그인 시 500 에러 (백엔드)

**증상**: 새 사용자 로그인 시 "등록되지 않은 사용자" 에러

**원인**: 기존 로직이 미리 등록된 사용자만 허용

**해결**: 자동 등록 로직 추가

```python
def verify_and_link(self, email, firebase_uid):
    # 1. Firebase UID로 검색
    member = self.db.query(FamilyMember).filter(
        FamilyMember.firebase_uid == firebase_uid
    ).first()

    # 2. 없으면 이메일로 검색 후 UID 연결
    if not member:
        member = self.db.query(FamilyMember).filter(
            FamilyMember.email == email
        ).first()
        if member:
            member.firebase_uid = firebase_uid
            self.db.commit()

    # 3. 둘 다 없으면 자동 생성
    if not member:
        member = FamilyMember(
            email=email,
            display_name=email.split("@")[0],
            firebase_uid=firebase_uid,
            color="#808080",  # 기본 색상
            is_registered=True,
        )
        self.db.add(member)
        self.db.commit()

    return FamilyMemberResponse.model_validate(member)
```

프론트엔드도 자동 등록 플로우를 추가했다.

```typescript
useEffect(() => {
  if (!user || isVerified) return;

  const verifyOrRegister = async () => {
    const member = await verifyCalendarMember();
    if (member) {
      setIsVerified(true);
      return;
    }

    // 자동 등록
    const displayName = user.displayName || user.email?.split('@')[0] || '사용자';
    await registerSelfAsMember(displayName);
    setIsVerified(true);
  };

  verifyOrRegister();
}, [user, isVerified]);
```

### 삽질 3: API 응답 형식 불일치

**증상**: `t.filter is not a function` 에러

**원인**: 백엔드가 `{ events: [...] }` 객체를 반환하는데, 프론트엔드는 배열을 기대

**해결**: 응답 추출 로직 추가

```typescript
export async function getEvents(startDate: string, endDate: string) {
  const response = await fetchWithAuth(
    `/calendar/events?start_date=${startDate}&end_date=${endDate}`
  );
  // 객체에서 배열 추출
  return response?.events || [];
}
```

### 삽질 4: ESLint react-hooks 에러

**증상**: `react-hooks/set-state-in-effect` 에러

**원인**: useEffect 안에서 여러 setState 호출

**해결**: 폼 상태를 단일 객체로 통합

```typescript
// Before: 10개의 개별 useState
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
// ...

// After: 단일 FormState 객체
interface FormState {
  title: string;
  description: string;
  startDate: Date;
  startTime: string;
  // ...
}

const [formState, setFormState] = useState<FormState>(getInitialFormState);
```

---

## Part 4: 테스트 전략

### 백엔드 테스트 피라미드

```
         /\
        /E2E\        8개 (실제 Firebase, DB)
       /──────\
      /Integration\ 43개 (Fake DI)
     /──────────────\
    /     Unit       \ 19개 (순수 로직)
   ──────────────────────
```

### 반복 로직 Unit 테스트

```python
def test_weekly_specific_days(self):
    """매주 월, 수, 금 반복"""
    occurrences = get_occurrences(
        rrule_str="FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR",
        dtstart=datetime(2024, 1, 1, 10, 0),
        range_start=date(2024, 1, 1),
        range_end=date(2024, 1, 7),
    )

    assert len(occurrences) == 3
    assert date(2024, 1, 1) in occurrences  # 월
    assert date(2024, 1, 3) in occurrences  # 수
    assert date(2024, 1, 5) in occurrences  # 금
```

### 프론트엔드 E2E 테스트 (Playwright)

```typescript
test('일정 생성 및 표시', async ({ page }) => {
  await page.goto('/');

  // 일정 추가 버튼 클릭
  await page.click('text=일정 추가');

  // 폼 작성
  await page.fill('[name=title]', '테스트 일정');
  await page.click('text=저장');

  // 캘린더에 일정 표시 확인
  await expect(page.locator('text=테스트 일정')).toBeVisible();
});
```

---

## 결과물

### 지원하는 기능

| 기능 | 설명 |
|------|------|
| **멀티 뷰** | 월간, 주간, 일간 뷰 전환 |
| **일정 CRUD** | 생성, 조회, 수정, 삭제 |
| **반복 일정** | 매일/매주/매월/매년 + 요일 지정 |
| **카테고리** | 색상별 분류 |
| **가족 구성원** | 멤버별 색상 표시 |
| **자동 등록** | 첫 로그인 시 자동 회원 생성 |
| **반응형** | 모바일/태블릿/데스크톱 대응 |

### 지원하는 반복 패턴

| 패턴 | API 요청 예시 |
|------|--------------|
| 매일 | `{"frequency": "DAILY"}` |
| 매주 | `{"frequency": "WEEKLY"}` |
| 매주 월/수/금 | `{"frequency": "WEEKLY", "weekdays": ["MO", "WE", "FR"]}` |
| 격주 | `{"frequency": "WEEKLY", "interval": 2}` |
| 매월 | `{"frequency": "MONTHLY"}` |
| 매년 | `{"frequency": "YEARLY"}` |

### 스크린샷

![월간 뷰](./images/month-view.png)
*월간 뷰: 멤버별 색상으로 일정 구분*

![주간 뷰](./images/week-view.png)
*주간 뷰: 시간대별 일정 확인*

![일정 생성](./images/event-dialog.png)
*일정 생성: 반복 설정 포함*

---

## 마치며

### 배운 점

**백엔드**
1. **Protocol 패턴**: 테스트 용이성이 크게 향상된다
2. **RRULE 표준**: 바퀴를 재발명하지 말자. RFC 5545는 검증된 표준이다
3. **점진적 개선**: 에러를 만나면서 개선하자. 테스트가 있으면 두렵지 않다

**프론트엔드**
1. **TypeScript 엄격 모드**: 런타임 에러를 빌드 타임에 잡을 수 있다
2. **shadcn/ui**: 커스터마이징 가능한 컴포넌트로 개발 속도 향상
3. **타임존 처리**: `toISOString()` 대신 로컬 Date 메서드를 사용하자

**풀스택**
1. **API 계약**: 백엔드-프론트엔드 응답 형식을 명확히 정의하자
2. **자동 등록**: 사용자 온보딩 마찰을 줄이자
3. **에러 핸들링**: Graceful degradation으로 오프라인에서도 동작하게

### 다음 과제

- [ ] 반복 일정 개별 수정 (RecurrenceException 활용)
- [ ] 일정 알림 (Firebase Cloud Messaging)
- [ ] 드래그 앤 드롭으로 일정 이동
- [ ] 다크 모드 지원
- [ ] React Native 앱 연동

---

**Live Demo**: https://calendar.funq.kr

*궁금한 점은 댓글로 남겨주세요!*
