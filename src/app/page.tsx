'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { EventDialog } from '@/components/calendar/EventDialog';
import {
  getEvents,
  getCategories,
  createEvent,
  updateEvent,
  deleteEvent,
  verifyCalendarMember,
  registerSelfAsMember,
} from '@/lib/api';

type ViewType = 'month' | 'week' | 'day';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  member: { name: string; color: string };
  category?: { name: string; color: string };
  category_id?: string;
  recurrence_rule?: string;
  recurrence_start?: string;
  recurrence_end?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  const [initialHour, setInitialHour] = useState<number | undefined>(undefined);
  const [isVerified, setIsVerified] = useState(false);

  const fetchEvents = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 2, 0).toISOString().split('T')[0];

    try {
      const data = await getEvents(startDate, endDate);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  }, [currentDate]);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || isVerified) return;

    const verifyOrRegister = async () => {
      try {
        const member = await verifyCalendarMember();
        if (member) {
          setIsVerified(true);
          return;
        }

        // Not a member yet - auto-register
        const displayName = user.displayName || user.email?.split('@')[0] || '사용자';
        await registerSelfAsMember(displayName);
        console.log('Auto-registered as calendar member');
        setIsVerified(true);
      } catch (error) {
        console.error('Failed to verify/register member:', error);
        // Allow UI to work even without backend (demo mode)
        setIsVerified(true);
      }
    };

    verifyOrRegister();
  }, [user, isVerified]);

  useEffect(() => {
    if (!isVerified) return;

    let cancelled = false;

    const loadData = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 2, 0).toISOString().split('T')[0];

      try {
        const [eventsData, categoriesData] = await Promise.all([
          getEvents(startDate, endDate),
          getCategories(),
        ]);
        if (!cancelled) {
          setEvents(Array.isArray(eventsData) ? eventsData : []);
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [isVerified, currentDate]);

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);

    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const delta = direction === 'prev' ? -1 : 1;

    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + delta);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + delta * 7);
    } else {
      newDate.setDate(newDate.getDate() + delta);
    }

    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setInitialDate(new Date());
    setInitialHour(9);
    setDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setInitialDate(undefined);
    setInitialHour(undefined);
    setDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedEvent(null);
    setInitialDate(date);
    setInitialHour(9);
    setDialogOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedEvent(null);
    setInitialDate(date);
    setInitialHour(hour);
    setDialogOpen(true);
  };

  const handleSaveEvent = async (eventData: {
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
  }) => {
    try {
      if (eventData.id) {
        await updateEvent(eventData.id, eventData);
      } else {
        await createEvent(eventData);
      }
      await fetchEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      await fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onAddEvent={handleAddEvent}
      />

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      )}

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onTimeSlotClick={handleTimeSlotClick}
        />
      )}

      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onTimeSlotClick={handleTimeSlotClick}
        />
      )}

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        categories={categories}
        initialDate={initialDate}
        initialHour={initialHour}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
