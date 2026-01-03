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
export async function getEvents(startDate: string, endDate: string) {
  try {
    return await fetchWithAuth(`/calendar/events?start_date=${startDate}&end_date=${endDate}`);
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
  recurrence_rule?: string;
  recurrence_start?: string;
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
