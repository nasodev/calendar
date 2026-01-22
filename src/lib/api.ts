import { getIdToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getIdToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Auth
export async function verifyCalendarMember() {
  try {
    return await fetchWithAuth('/calendar/auth/verify');
  } catch {
    return null;
  }
}

// Auto-register current user as a calendar member
export async function registerSelfAsMember(displayName: string, color?: string) {
  const randomColor = color || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  return fetchWithAuth('/calendar/members', {
    method: 'POST',
    body: JSON.stringify({
      display_name: displayName,
      color: randomColor,
    }),
  });
}

// Members
export async function getMembers() {
  try {
    return await fetchWithAuth('/calendar/members');
  } catch {
    return [];
  }
}

export async function createMember(data: { display_name: string; color: string }) {
  return fetchWithAuth('/calendar/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMember(id: string, data: { display_name?: string; color?: string }) {
  return fetchWithAuth(`/calendar/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteMember(id: string) {
  return fetchWithAuth(`/calendar/members/${id}`, { method: 'DELETE' });
}

// Categories
export async function getCategories() {
  try {
    return await fetchWithAuth('/calendar/categories');
  } catch {
    return [];
  }
}

export async function createCategory(data: { name: string; color: string; icon?: string }) {
  return fetchWithAuth('/calendar/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: { name?: string; color?: string; icon?: string }) {
  return fetchWithAuth(`/calendar/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  return fetchWithAuth(`/calendar/categories/${id}`, { method: 'DELETE' });
}

// Events
export interface RecurrencePattern {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  weekdays?: ('MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU')[];
  count?: number;
  until?: string;
}

export async function getEvents(startDate: string, endDate: string) {
  try {
    const response = await fetchWithAuth(`/calendar/events?start_date=${startDate}&end_date=${endDate}`);
    // Backend returns { events: [...] }, extract the array
    return response?.events || [];
  } catch {
    return [];
  }
}

export async function createEvent(data: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  category_id?: string;
  recurrence_pattern?: RecurrencePattern;
  recurrence_end?: string;
}) {
  return fetchWithAuth('/calendar/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id: string, data: Partial<{
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  category_id: string;
}>) {
  return fetchWithAuth(`/calendar/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string) {
  return fetchWithAuth(`/calendar/events/${id}`, { method: 'DELETE' });
}

// Calendar AI Types
export interface ParsedEvent {
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  description?: string;
  recurrence?: string;
}

export interface AIParseResponse {
  success: boolean;
  pending_id?: string;
  events?: ParsedEvent[];
  message?: string;
  expires_at?: string;
  error?: string;
}

export interface AIConfirmResponse {
  success: boolean;
  created_count?: number;
  event_ids?: string[];
  error?: string;
}

export interface PendingEventItem {
  id: string;
  events: ParsedEvent[];
  message: string;
  created_at: string;
  expires_at: string;
}

export interface PendingListResponse {
  count: number;
  pending_events: PendingEventItem[];
}

// Calendar AI Functions
export async function aiParse(text?: string, imageBase64?: string): Promise<AIParseResponse> {
  try {
    return await fetchWithAuth('/calendar/ai/parse', {
      method: 'POST',
      body: JSON.stringify({
        text,
        image_base64: imageBase64,
      }),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function aiConfirm(
  pendingId: string,
  modifications?: ParsedEvent[]
): Promise<AIConfirmResponse> {
  try {
    return await fetchWithAuth(`/calendar/ai/confirm/${pendingId}`, {
      method: 'POST',
      body: JSON.stringify({
        modifications,
      }),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function aiCancel(pendingId: string): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchWithAuth(`/calendar/ai/cancel/${pendingId}`, {
      method: 'POST',
    });
  } catch {
    return {
      success: false,
    };
  }
}

export async function aiGetPending(): Promise<PendingListResponse> {
  try {
    return await fetchWithAuth('/calendar/ai/pending');
  } catch {
    return { count: 0, pending_events: [] };
  }
}
