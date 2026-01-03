'use client';

import { Fragment } from 'react';
import { EventCard } from './EventCard';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  member: { name: string; color: string };
  category?: { name: string; color: string };
  is_recurring?: boolean;
  occurrence_date?: string;
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
    // Use local date comparison to avoid timezone issues
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      const eventHour = eventDate.getHours();

      // For recurring events, use occurrence_date for date comparison
      if (event.is_recurring && event.occurrence_date) {
        const [y, m, d] = event.occurrence_date.split('-').map(Number);
        return y === year && m - 1 === month && d === day && eventHour === hour;
      }

      return (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === month &&
        eventDate.getDate() === day &&
        eventHour === hour
      );
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
      {/* Week header */}
      <div className="grid grid-cols-8 border-b min-w-[600px] md:min-w-0">
        <div className="p-1 md:p-2" />
        {days.map((date, i) => (
          <div
            key={i}
            className={`p-1 md:p-2 text-center border-l ${
              isToday(date) ? 'bg-primary/10' : ''
            }`}
          >
            <div className={`text-xs md:text-sm ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}`}>
              {weekdays[i]}
            </div>
            <div className={`text-sm md:text-lg ${isToday(date) ? 'font-bold' : ''}`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid - scrollable horizontally on mobile */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 min-w-[600px] md:min-w-0">
          {hours.map((hour) => (
            <Fragment key={hour}>
              <div className="p-1 md:p-2 text-right text-xs md:text-sm text-muted-foreground border-b">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((date, dayIndex) => {
                const hourEvents = getEventsForDateAndHour(date, hour);
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    onClick={() => onTimeSlotClick(date, hour)}
                    className="border-l border-b min-h-[48px] md:min-h-[60px] p-0.5 md:p-1 cursor-pointer hover:bg-muted/50"
                  >
                    {/* Mobile: compact events */}
                    <div className="md:hidden space-y-0.5">
                      {hourEvents.slice(0, 1).map((event) => (
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
                      {hourEvents.length > 1 && (
                        <p className="text-[10px] text-muted-foreground">
                          +{hourEvents.length - 1}
                        </p>
                      )}
                    </div>
                    {/* Desktop: full events */}
                    <div className="hidden md:block space-y-1">
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
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
