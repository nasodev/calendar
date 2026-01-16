'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { EventDialog } from '@/components/calendar/EventDialog';
import { CategoryDialog } from '@/components/calendar/CategoryDialog';
import {
  getEvents,
  getCategories,
  createEvent,
  updateEvent,
  deleteEvent,
  createCategory,
  updateCategory,
  deleteCategory,
  verifyCalendarMember,
  registerSelfAsMember,
  type RecurrencePattern,
} from '@/lib/api';
import {
  getDemoEvents,
  saveDemoEvent,
  updateDemoEvent,
  deleteDemoEvent,
  DEMO_CATEGORIES,
} from '@/lib/storage';

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
  is_recurring?: boolean;
  occurrence_date?: string;
  recurrence_pattern?: RecurrencePattern;
  recurrence_end?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function Home() {
  const { user, loading } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  const [initialHour, setInitialHour] = useState<number | undefined>(undefined);
  const [isVerified, setIsVerified] = useState(false);

  const fetchEvents = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 2, 0).toISOString().split('T')[0];

    if (!user) {
      // 데모 모드: localStorage에서 로드
      setEvents(getDemoEvents(startDate, endDate));
      return;
    }

    try {
      const data = await getEvents(startDate, endDate);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  }, [currentDate, user]);


  // 데모 모드: 로그인하지 않은 사용자
  const isDemo = !user && !loading;

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
    // 데모 모드 또는 인증된 사용자만 데이터 로드
    if (!isDemo && !isVerified) return;

    let cancelled = false;

    const loadData = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 2, 0).toISOString().split('T')[0];

      if (isDemo) {
        // 데모 모드: localStorage에서 로드
        setEvents(getDemoEvents(startDate, endDate));
        setCategories([...DEMO_CATEGORIES]);
        return;
      }

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
  }, [isDemo, isVerified, currentDate]);

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
    recurrence_pattern?: RecurrencePattern;
    recurrence_end?: string;
  }) => {
    if (isDemo) {
      // 데모 모드: localStorage에 저장
      if (eventData.id) {
        updateDemoEvent(eventData.id, eventData);
      } else {
        saveDemoEvent(eventData);
      }
      await fetchEvents();
      return;
    }

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
    if (isDemo) {
      // 데모 모드: localStorage에서 삭제
      deleteDemoEvent(id);
      await fetchEvents();
      return;
    }

    try {
      await deleteEvent(id);
      await fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCreateCategory = async (data: { name: string; color: string; icon?: string }) => {
    try {
      await createCategory(data);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, data: { name?: string; color?: string; icon?: string }) => {
    try {
      await updateCategory(id, data);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onAddEvent={handleAddEvent}
        onOpenSettings={() => setCategoryDialogOpen(true)}
        isDemo={isDemo}
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

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
