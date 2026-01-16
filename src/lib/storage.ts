// localStorage 기반 데모 모드 데이터 관리

const EVENTS_KEY = 'calendar_demo_events';

// 데모 모드용 기본 카테고리
export const DEMO_CATEGORIES = [
  { id: 'family', name: '가족', color: '#4CAF50' },
  { id: 'school', name: '학교', color: '#2196F3' },
  { id: 'work', name: '일', color: '#FF9800' },
  { id: 'etc', name: '기타', color: '#9E9E9E' },
] as const;

// 데모 모드용 기본 멤버
const DEMO_MEMBER = { name: '게스트', color: '#9C27B0' };

export interface DemoEvent {
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
  recurrence_pattern?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    weekdays?: ('MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU')[];
  };
  recurrence_end?: string;
}

function getStoredEvents(): DemoEvent[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredEvents(events: DemoEvent[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function getDemoEvents(startDate: string, endDate: string): DemoEvent[] {
  const events = getStoredEvents();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return events.filter(event => {
    const eventStart = new Date(event.start_time);
    return eventStart >= start && eventStart <= end;
  });
}

export function saveDemoEvent(eventData: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  category_id?: string;
  recurrence_pattern?: DemoEvent['recurrence_pattern'];
  recurrence_end?: string;
}): DemoEvent {
  const events = getStoredEvents();

  const category = eventData.category_id
    ? DEMO_CATEGORIES.find(c => c.id === eventData.category_id)
    : undefined;

  const newEvent: DemoEvent = {
    id: crypto.randomUUID(),
    ...eventData,
    member: DEMO_MEMBER,
    category: category ? { name: category.name, color: category.color } : undefined,
  };

  events.push(newEvent);
  saveStoredEvents(events);

  return newEvent;
}

export function updateDemoEvent(
  id: string,
  data: Partial<Omit<DemoEvent, 'id' | 'member'>>
): DemoEvent | null {
  const events = getStoredEvents();
  const index = events.findIndex(e => e.id === id);

  if (index === -1) return null;

  const category = data.category_id
    ? DEMO_CATEGORIES.find(c => c.id === data.category_id)
    : events[index].category;

  events[index] = {
    ...events[index],
    ...data,
    category: category ? { name: category.name, color: category.color } : undefined,
  };

  saveStoredEvents(events);
  return events[index];
}

export function deleteDemoEvent(id: string): boolean {
  const events = getStoredEvents();
  const filtered = events.filter(e => e.id !== id);

  if (filtered.length === events.length) return false;

  saveStoredEvents(filtered);
  return true;
}
