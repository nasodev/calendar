# Calendar AI 프론트엔드 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 백엔드 Calendar AI API와 연동하여 텍스트/이미지 입력으로 일정을 파싱하고 미리보기 후 등록하는 프론트엔드 기능 구현

**Architecture:**
- CalendarHeader에 AI 일정 등록 버튼 추가
- AIScheduleDialog 컴포넌트로 입력/미리보기/확정 플로우 처리
- api.ts에 Calendar AI API 함수 추가 (parse, confirm, cancel, pending)

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, date-fns (Korean locale)

---

## Task 1: API 함수 추가

**Files:**
- Modify: `src/lib/api.ts`

**Step 1: ParsedEvent 및 응답 타입 정의**

`src/lib/api.ts` 파일 끝에 Calendar AI 타입과 함수 추가:

```typescript
// Calendar AI Types
export interface ParsedEvent {
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  description?: string;
  recurrence?: string;
}

export interface AIParseResponse {
  success: boolean;
  pending_id?: string;
  events?: ParsedEvent[];
  message?: string;
  expires_at?: string;
  error?: string;
}

export interface AIConfirmResponse {
  success: boolean;
  created_count?: number;
  event_ids?: string[];
  error?: string;
}

export interface PendingEventItem {
  id: string;
  events: ParsedEvent[];
  message: string;
  created_at: string;
  expires_at: string;
}

export interface PendingListResponse {
  count: number;
  pending_events: PendingEventItem[];
}
```

**Step 2: aiParse 함수 추가**

```typescript
// Calendar AI Functions
export async function aiParse(text?: string, imageBase64?: string): Promise<AIParseResponse> {
  try {
    return await fetchWithAuth('/calendar/ai/parse', {
      method: 'POST',
      body: JSON.stringify({
        text,
        image_base64: imageBase64,
      }),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Step 3: aiConfirm 함수 추가**

```typescript
export async function aiConfirm(
  pendingId: string,
  modifications?: ParsedEvent[]
): Promise<AIConfirmResponse> {
  try {
    return await fetchWithAuth(`/calendar/ai/confirm/${pendingId}`, {
      method: 'POST',
      body: JSON.stringify({
        modifications,
      }),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Step 4: aiCancel 함수 추가**

```typescript
export async function aiCancel(pendingId: string): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchWithAuth(`/calendar/ai/cancel/${pendingId}`, {
      method: 'POST',
    });
  } catch (error) {
    return {
      success: false,
    };
  }
}
```

**Step 5: aiGetPending 함수 추가**

```typescript
export async function aiGetPending(): Promise<PendingListResponse> {
  try {
    return await fetchWithAuth('/calendar/ai/pending');
  } catch {
    return { count: 0, pending_events: [] };
  }
}
```

**Step 6: 린트 확인**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npm run lint`
Expected: PASS (no errors)

**Step 7: 타입 체크**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npx tsc --noEmit`
Expected: PASS (no type errors)

**Step 8: Commit**

```bash
git add src/lib/api.ts
git commit -m "$(cat <<'EOF'
feat: add Calendar AI API functions

- aiParse: parse text/image to events
- aiConfirm: confirm pending events
- aiCancel: cancel pending events
- aiGetPending: list pending events

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: AIScheduleDialog 컴포넌트 생성

**Files:**
- Create: `src/components/calendar/AIScheduleDialog.tsx`

**Step 1: 컴포넌트 기본 구조 생성**

```typescript
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, ImagePlus, X, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  aiParse,
  aiConfirm,
  aiCancel,
  type ParsedEvent,
  type AIParseResponse,
} from '@/lib/api';

interface AIScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type DialogState = 'input' | 'loading' | 'preview' | 'confirming' | 'success' | 'error';

export function AIScheduleDialog({
  open,
  onOpenChange,
  onSuccess,
}: AIScheduleDialogProps) {
  const [state, setState] = useState<DialogState>('input');
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<AIParseResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetDialog = () => {
    setState('input');
    setText('');
    setImagePreview(null);
    setImageBase64(null);
    setParseResult(null);
    setErrorMessage('');
  };

  const handleClose = () => {
    // 미리보기 상태에서 닫으면 취소 처리
    if (parseResult?.pending_id && state === 'preview') {
      aiCancel(parseResult.pending_id);
    }
    resetDialog();
    onOpenChange(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('이미지는 5MB 이하만 가능합니다');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleParse = async () => {
    if (!text.trim() && !imageBase64) {
      setErrorMessage('텍스트를 입력하거나 이미지를 첨부해주세요');
      return;
    }

    setState('loading');
    setErrorMessage('');

    const result = await aiParse(text || undefined, imageBase64 || undefined);

    if (result.success && result.events && result.events.length > 0) {
      setParseResult(result);
      setState('preview');
    } else {
      setErrorMessage(result.error || result.message || '일정을 인식하지 못했습니다');
      setState('error');
    }
  };

  const handleConfirm = async () => {
    if (!parseResult?.pending_id) return;

    setState('confirming');

    const result = await aiConfirm(parseResult.pending_id);

    if (result.success) {
      setState('success');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } else {
      setErrorMessage(result.error || '일정 등록에 실패했습니다');
      setState('error');
    }
  };

  const handleCancel = async () => {
    if (parseResult?.pending_id) {
      await aiCancel(parseResult.pending_id);
    }
    resetDialog();
  };

  const formatEventTime = (event: ParsedEvent) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);

    if (event.all_day) {
      return format(start, 'M월 d일 (E)', { locale: ko }) + ' 종일';
    }

    const isSameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd');

    if (isSameDay) {
      return `${format(start, 'M월 d일 (E)', { locale: ko })} ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    }

    return `${format(start, 'M월 d일 HH:mm', { locale: ko })} - ${format(end, 'M월 d일 HH:mm', { locale: ko })}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {state === 'input' && 'AI 일정 등록'}
            {state === 'loading' && '일정 분석 중...'}
            {state === 'preview' && '일정 확인'}
            {state === 'confirming' && '등록 중...'}
            {state === 'success' && '등록 완료!'}
            {state === 'error' && '오류'}
          </DialogTitle>
        </DialogHeader>

        {/* Input State */}
        {state === 'input' && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ai-text">일정 내용</Label>
              <Input
                id="ai-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="예: 내일 오후 3시 치과 예약"
                className="h-10"
              />
            </div>

            <div className="grid gap-2">
              <Label>이미지 첨부 (선택)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="첨부 이미지"
                    className="max-h-40 rounded-md object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="h-20 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-6 w-6 mr-2" />
                  이미지 추가
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                학교 알림장, 포스터 등 이미지에서 일정을 추출합니다
              </p>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
        )}

        {/* Loading State */}
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">AI가 일정을 분석하고 있습니다...</p>
          </div>
        )}

        {/* Preview State */}
        {state === 'preview' && parseResult?.events && (
          <div className="grid gap-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">{parseResult.message}</p>
            </div>

            <div className="space-y-3">
              {parseResult.events.map((event, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 space-y-1"
                >
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventTime(event)}
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  {event.recurrence && (
                    <p className="text-xs text-blue-600">반복: {event.recurrence}</p>
                  )}
                </div>
              ))}
            </div>

            {parseResult.expires_at && (
              <p className="text-xs text-muted-foreground text-center">
                {format(new Date(parseResult.expires_at), 'HH:mm', { locale: ko })}까지 유효
              </p>
            )}
          </div>
        )}

        {/* Confirming State */}
        {state === 'confirming' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">일정을 등록하고 있습니다...</p>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-muted-foreground">일정이 등록되었습니다!</p>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-600">{errorMessage}</p>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          {state === 'input' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button onClick={handleParse} disabled={!text.trim() && !imageBase64}>
                분석하기
              </Button>
            </>
          )}

          {state === 'preview' && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                다시 입력
              </Button>
              <Button onClick={handleConfirm}>
                등록하기
              </Button>
            </>
          )}

          {state === 'error' && (
            <Button onClick={resetDialog}>
              다시 시도
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: 린트 확인**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npm run lint`
Expected: PASS

**Step 3: 타입 체크**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/calendar/AIScheduleDialog.tsx
git commit -m "$(cat <<'EOF'
feat: add AIScheduleDialog component

- Text input for natural language schedule
- Image upload with base64 conversion
- Preview parsed events before confirmation
- Success/error state handling

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: CalendarHeader에 AI 버튼 추가

**Files:**
- Modify: `src/components/calendar/CalendarHeader.tsx`

**Step 1: Wand2 아이콘 import 추가**

현재 import 문에 `Wand2` 추가:

```typescript
import { ChevronLeft, ChevronRight, Plus, Calendar, Settings, LogIn, Wand2 } from 'lucide-react';
```

**Step 2: Props에 onAISchedule 추가**

```typescript
interface CalendarHeaderProps {
  currentDate: Date;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onAddEvent: () => void;
  onAISchedule: () => void;  // 추가
  onOpenSettings: () => void;
  isDemo?: boolean;
}
```

**Step 3: Props destructuring에 onAISchedule 추가**

```typescript
export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onAddEvent,
  onAISchedule,  // 추가
  onOpenSettings,
  isDemo = false,
}: CalendarHeaderProps) {
```

**Step 4: AI 버튼 추가 (모바일용 - 일정 추가 버튼 앞에)**

Settings 버튼과 일정 추가 버튼 사이에 AI 버튼 추가:

```typescript
        {/* AI Schedule button - only for logged-in users */}
        {!isDemo && (
          <>
            {/* Mobile: icon only */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={onAISchedule}
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            {/* Desktop: with text */}
            <Button
              variant="outline"
              className="hidden md:flex"
              onClick={onAISchedule}
            >
              <Wand2 className="h-4 w-4 mr-1" />
              AI 등록
            </Button>
          </>
        )}
```

**Step 5: 린트 확인**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npm run lint`
Expected: PASS

**Step 6: 타입 체크**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npx tsc --noEmit`
Expected: PASS

**Step 7: Commit**

```bash
git add src/components/calendar/CalendarHeader.tsx
git commit -m "$(cat <<'EOF'
feat: add AI schedule button to CalendarHeader

- Add Wand2 icon for AI feature
- Show AI button only for logged-in users
- Responsive: icon-only on mobile, text on desktop

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: 메인 페이지에 AI 다이얼로그 통합

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: AIScheduleDialog import 추가**

```typescript
import { AIScheduleDialog } from '@/components/calendar/AIScheduleDialog';
```

**Step 2: aiDialogOpen 상태 추가**

`categoryDialogOpen` 상태 아래에 추가:

```typescript
const [aiDialogOpen, setAiDialogOpen] = useState(false);
```

**Step 3: handleAISchedule 핸들러 추가**

`handleAddEvent` 핸들러 근처에 추가:

```typescript
const handleAISchedule = () => {
  setAiDialogOpen(true);
};

const handleAISuccess = () => {
  fetchEvents();
};
```

**Step 4: CalendarHeader에 onAISchedule prop 추가**

```typescript
<CalendarHeader
  currentDate={currentDate}
  view={view}
  onViewChange={handleViewChange}
  onNavigate={handleNavigate}
  onAddEvent={handleAddEvent}
  onAISchedule={handleAISchedule}  // 추가
  onOpenSettings={() => setCategoryDialogOpen(true)}
  isDemo={isDemo}
/>
```

**Step 5: AIScheduleDialog 컴포넌트 추가 (CategoryDialog 아래에)**

```typescript
<AIScheduleDialog
  open={aiDialogOpen}
  onOpenChange={setAiDialogOpen}
  onSuccess={handleAISuccess}
/>
```

**Step 6: 린트 확인**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npm run lint`
Expected: PASS

**Step 7: 타입 체크**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npx tsc --noEmit`
Expected: PASS

**Step 8: Commit**

```bash
git add src/app/page.tsx
git commit -m "$(cat <<'EOF'
feat: integrate AIScheduleDialog in main page

- Add AI dialog state management
- Connect AI button to dialog
- Refresh events on successful AI registration

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: 빌드 및 수동 테스트

**Files:**
- No file changes

**Step 1: 개발 서버 실행**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npm run dev`
Expected: Server starts on port 3002

**Step 2: 수동 테스트 체크리스트**

브라우저에서 http://localhost:3002 접속 후 확인:

1. **데모 모드** (로그인 안 함):
   - [ ] AI 등록 버튼이 보이지 않음

2. **로그인 후**:
   - [ ] AI 등록 버튼 표시 (모바일: 아이콘만, 데스크톱: "AI 등록" 텍스트)
   - [ ] AI 등록 버튼 클릭 시 다이얼로그 열림

3. **AI 다이얼로그 입력**:
   - [ ] 텍스트 입력 가능
   - [ ] 이미지 첨부 가능 (5MB 이하)
   - [ ] 이미지 미리보기 및 삭제 가능
   - [ ] "분석하기" 버튼 활성화 (텍스트 또는 이미지 있을 때)

4. **AI 파싱 결과**:
   - [ ] 로딩 상태 표시
   - [ ] 성공 시 미리보기 표시
   - [ ] 실패 시 에러 메시지 표시

5. **일정 확정**:
   - [ ] "등록하기" 클릭 시 일정 생성
   - [ ] 성공 메시지 표시 후 다이얼로그 닫힘
   - [ ] 캘린더에 새 일정 표시

**Step 3: 빌드 확인**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npm run build`
Expected: Build succeeds without errors

**Step 4: Commit (if changes needed)**

수동 테스트 중 수정이 필요한 경우에만 커밋

---

## Task 6: E2E 테스트 작성

**Files:**
- Create: `tests/ai-schedule/ai-parse-basic.spec.ts`
- Create: `tests/ai-schedule/ai-image-upload.spec.ts`

**Step 1: 테스트 디렉토리 생성**

Run: `mkdir -p /Users/hklee03-macbook/dev/funq/calendar/tests/ai-schedule`

**Step 2: 기본 파싱 테스트 작성**

```typescript
// tests/ai-schedule/ai-parse-basic.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AI Schedule - Basic Parsing', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인된 상태로 시작 (auth.setup.ts 활용)
    await page.goto('/');
    await page.waitForSelector('[data-testid="calendar-header"]');
  });

  test('should show AI button for logged-in users', async ({ page }) => {
    const aiButton = page.getByRole('button', { name: /AI 등록|Wand/i });
    await expect(aiButton).toBeVisible();
  });

  test('should open AI dialog on button click', async ({ page }) => {
    await page.getByRole('button', { name: /AI 등록|Wand/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('AI 일정 등록')).toBeVisible();
  });

  test('should enable parse button when text is entered', async ({ page }) => {
    await page.getByRole('button', { name: /AI 등록|Wand/i }).click();

    const parseButton = page.getByRole('button', { name: '분석하기' });
    await expect(parseButton).toBeDisabled();

    await page.getByPlaceholder(/내일 오후 3시 치과/i).fill('내일 회의');
    await expect(parseButton).toBeEnabled();
  });

  test('should close dialog on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /AI 등록|Wand/i }).click();
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
```

**Step 3: 이미지 업로드 테스트 작성**

```typescript
// tests/ai-schedule/ai-image-upload.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('AI Schedule - Image Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="calendar-header"]');
    await page.getByRole('button', { name: /AI 등록|Wand/i }).click();
  });

  test('should show image preview after upload', async ({ page }) => {
    // 테스트 이미지 파일 필요 - 실제 테스트 시 적절한 이미지 경로 사용
    const fileInput = page.locator('input[type="file"]');

    // 파일 선택기 트리거
    await page.getByRole('button', { name: '이미지 추가' }).click();

    // Note: 실제 테스트에서는 테스트 이미지 필요
    // await fileInput.setInputFiles(path.join(__dirname, 'fixtures/schedule-image.png'));
    // await expect(page.locator('img[alt="첨부 이미지"]')).toBeVisible();
  });

  test('should remove image on X button click', async ({ page }) => {
    // 이미지 업로드 후 삭제 테스트
    // Note: 실제 테스트 이미지 필요
  });

  test('should show error for oversized image', async ({ page }) => {
    // 5MB 초과 이미지 테스트
    // Note: 큰 테스트 이미지 필요
  });
});
```

**Step 4: 테스트 실행**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npx playwright test tests/ai-schedule/`
Expected: Tests pass (일부는 백엔드 연동 필요로 skip 가능)

**Step 5: Commit**

```bash
git add tests/ai-schedule/
git commit -m "$(cat <<'EOF'
test: add E2E tests for AI schedule feature

- Basic dialog interaction tests
- Image upload tests (placeholder)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: CalendarHeader에 data-testid 추가

**Files:**
- Modify: `src/components/calendar/CalendarHeader.tsx`

**Step 1: 최상위 div에 data-testid 추가**

```typescript
return (
  <div className="flex flex-col border-b" data-testid="calendar-header">
```

**Step 2: 린트 확인**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npm run lint`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/calendar/CalendarHeader.tsx
git commit -m "$(cat <<'EOF'
test: add data-testid to CalendarHeader

For E2E test reliability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: 최종 빌드 및 검증

**Files:**
- No file changes

**Step 1: 전체 린트 확인**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npm run lint`
Expected: PASS

**Step 2: 전체 타입 체크**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npx tsc --noEmit`
Expected: PASS

**Step 3: 프로덕션 빌드**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && npm run build`
Expected: Build succeeds

**Step 4: Git 상태 확인**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && git status`
Expected: Working tree clean (all changes committed)

**Step 5: 커밋 히스토리 확인**

Run: `cd /Users/hklee03-macbook/dev/funq/calendar && git log --oneline -10`
Expected: 모든 feat/test 커밋 확인

---

## 요약

| Task | 파일 | 설명 |
|------|------|------|
| 1 | `src/lib/api.ts` | Calendar AI API 함수 추가 |
| 2 | `src/components/calendar/AIScheduleDialog.tsx` | AI 다이얼로그 컴포넌트 생성 |
| 3 | `src/components/calendar/CalendarHeader.tsx` | AI 버튼 추가 |
| 4 | `src/app/page.tsx` | AI 다이얼로그 통합 |
| 5 | - | 빌드 및 수동 테스트 |
| 6 | `tests/ai-schedule/*.spec.ts` | E2E 테스트 작성 |
| 7 | `src/components/calendar/CalendarHeader.tsx` | data-testid 추가 |
| 8 | - | 최종 빌드 및 검증 |

## 주요 사용자 플로우

```
1. 사용자: AI 등록 버튼 클릭
2. 다이얼로그: 텍스트 입력 또는 이미지 첨부
3. 사용자: "분석하기" 클릭
4. 다이얼로그: 로딩 → 미리보기 표시
5. 사용자: "등록하기" 클릭
6. 다이얼로그: 성공 메시지 → 닫힘
7. 캘린더: 새 일정 표시
```
