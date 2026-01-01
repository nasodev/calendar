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
