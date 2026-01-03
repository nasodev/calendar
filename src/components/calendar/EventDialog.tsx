'use client';

import { useState, useRef, useLayoutEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Category {
  id: string;
  name: string;
  color: string;
}

type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

interface RecurrencePattern {
  frequency: Frequency;
  interval?: number;
  weekdays?: Weekday[];
}

interface EventData {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  category_id?: string;
  recurrence_pattern?: RecurrencePattern;
  recurrence_end?: string;
}

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: EventData | null;
  categories: Category[];
  initialDate?: Date;
  initialHour?: number;
  onSave: (event: EventData) => void;
  onDelete?: (id: string) => void;
}

const FREQUENCY_OPTIONS: { value: 'none' | Frequency; label: string }[] = [
  { value: 'none', label: '반복 안 함' },
  { value: 'DAILY', label: '매일' },
  { value: 'WEEKLY', label: '매주' },
  { value: 'MONTHLY', label: '매월' },
  { value: 'YEARLY', label: '매년' },
];

const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
  { value: 'MO', label: '월' },
  { value: 'TU', label: '화' },
  { value: 'WE', label: '수' },
  { value: 'TH', label: '목' },
  { value: 'FR', label: '금' },
  { value: 'SA', label: '토' },
  { value: 'SU', label: '일' },
];

export function EventDialog({
  open,
  onOpenChange,
  event,
  categories,
  initialDate,
  initialHour,
  onSave,
  onDelete,
}: EventDialogProps) {
  interface FormState {
    title: string;
    description: string;
    startDate: Date;
    startTime: string;
    endDate: Date;
    endTime: string;
    allDay: boolean;
    categoryId: string;
    frequency: 'none' | Frequency;
    weekdays: Weekday[];
    recurrenceEnd: Date | undefined;
  }

  const getInitialFormState = (): FormState => {
    if (event) {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      return {
        title: event.title,
        description: event.description || '',
        startDate: start,
        startTime: format(start, 'HH:mm'),
        endDate: end,
        endTime: format(end, 'HH:mm'),
        allDay: event.all_day,
        categoryId: event.category_id || '',
        frequency: event.recurrence_pattern?.frequency || 'none',
        weekdays: event.recurrence_pattern?.weekdays || [],
        recurrenceEnd: event.recurrence_end ? new Date(event.recurrence_end) : undefined,
      };
    }
    const date = initialDate || new Date();
    const hour = initialHour ?? 9;
    return {
      title: '',
      description: '',
      startDate: date,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endDate: date,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      allDay: false,
      categoryId: '',
      frequency: 'none',
      weekdays: [],
      recurrenceEnd: undefined,
    };
  };

  const [formState, setFormState] = useState<FormState>(getInitialFormState);
  const { title, description, startDate, startTime, endDate, endTime, allDay, categoryId, frequency, weekdays, recurrenceEnd } = formState;

  const setTitle = (v: string) => setFormState(s => ({ ...s, title: v }));
  const setDescription = (v: string) => setFormState(s => ({ ...s, description: v }));
  const setStartDate = (v: Date) => setFormState(s => ({ ...s, startDate: v }));
  const setStartTime = (v: string) => setFormState(s => ({ ...s, startTime: v }));
  const setEndDate = (v: Date) => setFormState(s => ({ ...s, endDate: v }));
  const setEndTime = (v: string) => setFormState(s => ({ ...s, endTime: v }));
  const setAllDay = (v: boolean) => setFormState(s => ({ ...s, allDay: v }));
  const setCategoryId = (v: string) => setFormState(s => ({ ...s, categoryId: v }));
  const setFrequency = (v: 'none' | Frequency) => setFormState(s => ({ ...s, frequency: v, weekdays: v !== 'WEEKLY' ? [] : s.weekdays }));
  const toggleWeekday = (day: Weekday) => setFormState(s => ({
    ...s,
    weekdays: s.weekdays.includes(day) ? s.weekdays.filter(d => d !== day) : [...s.weekdays, day]
  }));
  const setRecurrenceEnd = (v: Date | undefined) => setFormState(s => ({ ...s, recurrenceEnd: v }));

  const prevOpenRef = useRef(open);

  useLayoutEffect(() => {
    // Reset form when dialog opens
    if (open && !prevOpenRef.current) {
      setFormState(getInitialFormState());
    }
    prevOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only reset on open state change
  }, [open]);

  const handleSave = () => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const isRecurring = frequency !== 'none';

    let recurrencePattern: RecurrencePattern | undefined;
    if (isRecurring) {
      recurrencePattern = { frequency: frequency as Frequency };
      if (frequency === 'WEEKLY' && weekdays.length > 0) {
        recurrencePattern.weekdays = weekdays;
      }
    }

    const eventData: EventData = {
      ...(event?.id && { id: event.id }),
      title,
      description: description || undefined,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      all_day: allDay,
      category_id: categoryId || undefined,
      recurrence_pattern: recurrencePattern,
      recurrence_end: isRecurring && recurrenceEnd ? format(recurrenceEnd, 'yyyy-MM-dd') : undefined,
    };

    onSave(eventData);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (event?.id && onDelete) {
      onDelete(event.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? '일정 수정' : '일정 추가'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 md:gap-4 py-2 md:py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              className="h-10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명 (선택사항)"
              className="h-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-5 w-5"
            />
            <Label htmlFor="allDay">종일</Label>
          </div>

          {/* Start date/time - stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="grid gap-2">
              <Label>시작일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal h-10">
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{format(startDate, 'PPP', { locale: ko })}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {!allDay && (
              <div className="grid gap-2">
                <Label>시작 시간</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10"
                />
              </div>
            )}
          </div>

          {/* End date/time - stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="grid gap-2">
              <Label>종료일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal h-10">
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{format(endDate, 'PPP', { locale: ko })}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {!allDay && (
              <div className="grid gap-2">
                <Label>종료 시간</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10"
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>카테고리</Label>
            <Select value={categoryId || 'none'} onValueChange={(v) => setCategoryId(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택 (선택사항)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>반복</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as 'none' | Frequency)}>
              <SelectTrigger>
                <SelectValue placeholder="반복 설정" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {frequency === 'WEEKLY' && (
            <div className="grid gap-2">
              <Label>반복 요일</Label>
              <div className="flex flex-wrap gap-1">
                {WEEKDAY_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={weekdays.includes(opt.value) ? 'default' : 'outline'}
                    size="sm"
                    className="w-9 h-9 p-0"
                    onClick={() => toggleWeekday(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                선택하지 않으면 시작일의 요일에만 반복됩니다
              </p>
            </div>
          )}

          {frequency !== 'none' && (
            <div className="grid gap-2">
              <Label>반복 종료일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recurrenceEnd ? format(recurrenceEnd, 'PPP', { locale: ko }) : '종료일 선택 (선택사항)'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={recurrenceEnd}
                    onSelect={setRecurrenceEnd}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
          {event?.id && onDelete && (
            <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto h-10">
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-10">
              취소
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()} className="w-full sm:w-auto h-10">
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
