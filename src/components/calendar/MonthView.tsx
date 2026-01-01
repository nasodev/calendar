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
