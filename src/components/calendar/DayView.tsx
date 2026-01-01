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

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function DayView({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      const eventHour = eventDate.getHours();
      return eventDateStr === dateStr && eventHour === hour;
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const weekdaysShort = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = currentDate.getDay();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day header */}
      <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] border-b">
        <div className="p-1 md:p-2" />
        <div
          className={`p-2 md:p-4 text-center border-l ${
            isToday() ? 'bg-primary/10' : ''
          }`}
        >
          <div
            className={`text-xs md:text-sm ${
              dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : ''
            }`}
          >
            <span className="md:hidden">{weekdaysShort[dayOfWeek]}</span>
            <span className="hidden md:inline">{weekdays[dayOfWeek]}</span>
          </div>
          <div className={`text-xl md:text-2xl ${isToday() ? 'font-bold' : ''}`}>
            {currentDate.getDate()}
          </div>
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            return (
              <div key={hour} className="contents">
                <div className="p-1 md:p-2 text-right text-xs md:text-sm text-muted-foreground border-b">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div
                  onClick={() => onTimeSlotClick(currentDate, hour)}
                  className="border-l border-b min-h-[60px] md:min-h-[80px] p-1 md:p-2 cursor-pointer hover:bg-muted/50"
                >
                  <div className="space-y-1">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
