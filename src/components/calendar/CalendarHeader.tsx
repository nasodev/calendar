'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';

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

  const formatTitleShort = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (view === 'month') {
      return `${year}.${month}`;
    }

    if (view === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      return `${weekStart.getMonth() + 1}/${weekStart.getDate()}~`;
    }

    return `${month}/${currentDate.getDate()}`;
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-2 md:p-4 border-b gap-2 md:gap-4">
      {/* Top row on mobile: Navigation + Title */}
      <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => onNavigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => onNavigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex"
          onClick={() => onNavigate('today')}
        >
          오늘
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="flex sm:hidden h-8 w-8"
          onClick={() => onNavigate('today')}
        >
          <Calendar className="h-4 w-4" />
        </Button>
        {/* Mobile title */}
        <h2 className="text-base font-semibold md:hidden">{formatTitleShort()}</h2>
        {/* Desktop title */}
        <h2 className="text-xl font-semibold hidden md:block">{formatTitle()}</h2>
      </div>

      {/* Bottom row on mobile: View toggle + Add button */}
      <div className="flex items-center justify-between md:justify-end gap-2">
        <div className="flex border rounded-md">
          {(['month', 'week', 'day'] as ViewType[]).map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange(v)}
              className="rounded-none first:rounded-l-md last:rounded-r-md h-8 px-2 md:px-3"
            >
              {v === 'month' ? '월' : v === 'week' ? '주' : '일'}
            </Button>
          ))}
        </div>
        {/* Mobile: icon only */}
        <Button size="icon" className="md:hidden h-8 w-8" onClick={onAddEvent}>
          <Plus className="h-4 w-4" />
        </Button>
        {/* Desktop: full text */}
        <Button className="hidden md:flex" onClick={onAddEvent}>
          <Plus className="h-4 w-4 mr-1" />
          일정 추가
        </Button>
      </div>
    </div>
  );
}
