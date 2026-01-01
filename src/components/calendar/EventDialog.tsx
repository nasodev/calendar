'use client';

import { useState, useEffect } from 'react';
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

interface EventData {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  category_id?: string;
  recurrence_rule?: string;
  recurrence_start?: string;
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

const RECURRENCE_OPTIONS = [
  { value: 'none', label: '반복 안 함' },
  { value: 'FREQ=DAILY', label: '매일' },
  { value: 'FREQ=WEEKLY', label: '매주' },
  { value: 'FREQ=MONTHLY', label: '매월' },
  { value: 'FREQ=YEARLY', label: '매년' },
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');
  const [recurrenceRule, setRecurrenceRule] = useState('');
  const [recurrenceEnd, setRecurrenceEnd] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      setStartDate(start);
      setStartTime(format(start, 'HH:mm'));
      setEndDate(end);
      setEndTime(format(end, 'HH:mm'));
      setAllDay(event.all_day);
      setCategoryId(event.category_id || '');
      setRecurrenceRule(event.recurrence_rule || 'none');
      if (event.recurrence_end) {
        setRecurrenceEnd(new Date(event.recurrence_end));
      } else {
        setRecurrenceEnd(undefined);
      }
    } else {
      const date = initialDate || new Date();
      const hour = initialHour ?? 9;
      setTitle('');
      setDescription('');
      setStartDate(date);
      setStartTime(`${hour.toString().padStart(2, '0')}:00`);
      setEndDate(date);
      setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
      setAllDay(false);
      setCategoryId('');
      setRecurrenceRule('none');
      setRecurrenceEnd(undefined);
    }
  }, [event, initialDate, initialHour, open]);

  const handleSave = () => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const actualRecurrenceRule = recurrenceRule === 'none' ? undefined : recurrenceRule;

    const eventData: EventData = {
      ...(event?.id && { id: event.id }),
      title,
      description: description || undefined,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      all_day: allDay,
      category_id: categoryId || undefined,
      recurrence_rule: actualRecurrenceRule,
      recurrence_start: actualRecurrenceRule ? format(startDate, 'yyyy-MM-dd') : undefined,
      recurrence_end: actualRecurrenceRule && recurrenceEnd ? format(recurrenceEnd, 'yyyy-MM-dd') : undefined,
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
            <Select value={recurrenceRule} onValueChange={setRecurrenceRule}>
              <SelectTrigger>
                <SelectValue placeholder="반복 설정" />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {recurrenceRule && recurrenceRule !== 'none' && (
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
