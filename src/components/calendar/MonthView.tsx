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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {weekdays.map((day, i) => (
          <div
            key={day}
            className={`p-1 md:p-2 text-center text-xs md:text-sm font-medium ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {weeks.flat().map((date, i) => {
          const dayEvents = getEventsForDate(date);
          // Show 1 event on mobile, 2 on tablet, 3 on desktop
          const mobileCount = 1;
          const tabletCount = 2;
          const desktopCount = 3;

          return (
            <div
              key={i}
              onClick={() => onDateClick(date)}
              className={`border-b border-r p-0.5 md:p-1 min-h-[60px] md:min-h-[100px] cursor-pointer hover:bg-muted/50 transition-colors ${
                !isCurrentMonth(date) ? 'bg-muted/30 text-muted-foreground' : ''
              }`}
            >
              {/* Date number */}
              <div
                className={`text-xs md:text-sm mb-0.5 md:mb-1 ${
                  isToday(date)
                    ? 'bg-primary text-primary-foreground w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs'
                    : ''
                }`}
              >
                {date.getDate()}
              </div>

              {/* Events - responsive count */}
              <div className="space-y-0.5 md:space-y-1">
                {/* Mobile: show 1 event */}
                <div className="md:hidden">
                  {dayEvents.slice(0, mobileCount).map((event) => (
                    <EventCard
                      key={event.id}
                      title={event.title}
                      memberColor={event.member.color}
                      categoryColor={event.category?.color}
                      memberName={event.member.name}
                      compact
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    />
                  ))}
                  {dayEvents.length > mobileCount && (
                    <p className="text-[10px] text-muted-foreground">
                      +{dayEvents.length - mobileCount}
                    </p>
                  )}
                </div>

                {/* Tablet: show 2 events */}
                <div className="hidden md:block lg:hidden">
                  {dayEvents.slice(0, tabletCount).map((event) => (
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
                  {dayEvents.length > tabletCount && (
                    <p className="text-xs text-muted-foreground">
                      +{dayEvents.length - tabletCount} more
                    </p>
                  )}
                </div>

                {/* Desktop: show 3 events */}
                <div className="hidden lg:block">
                  {dayEvents.slice(0, desktopCount).map((event) => (
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
                  {dayEvents.length > desktopCount && (
                    <p className="text-xs text-muted-foreground">
                      +{dayEvents.length - desktopCount} more
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
