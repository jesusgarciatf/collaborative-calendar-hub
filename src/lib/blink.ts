import { createClient } from '@blinkdotnew/sdk';
import { getCookie, setCookie } from 'cookies-next';

function getProjectId(): string {
  const envId = import.meta.env.VITE_BLINK_PROJECT_ID;
  if (envId) return envId;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const match = hostname.match(/^([^.]+)\.sites\.blink\.new$/);
  if (match) return match[1];
  return 'calendar-schedule-app-bk3bcb1c';
}

export const blink = createClient({
  projectId: getProjectId(),
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY,
  auth: { mode: 'managed' },
});

// Anonymous ID logic
export function getAnonymousId(): string {
  let id = getCookie('anonymous_id');
  if (!id) {
    id = `anon_${Math.random().toString(36).substring(2, 15)}`;
    setCookie('anonymous_id', id, { maxAge: 60 * 60 * 24 * 365 });
  }
  return id as string;
}

export type UserRole = 'admin' | 'reviewer' | 'subscriber' | 'anonymous';

export async function getUserRole(userId: string): Promise<UserRole> {
  if (userId.startsWith('anon_')) return 'anonymous';
  
  // In a real app, you might fetch this from a users table or auth metadata
  // For this app, we'll assume the first real user is admin, others are subscribers
  // Or check auth metadata if available
  const user = await blink.auth.me();
  if (user?.role === 'admin') return 'admin';
  if (user?.role === 'reviewer') return 'reviewer';
  return 'subscriber';
}
