import { useSyncExternalStore } from 'react';
import { apiGet, apiPost, ApiError } from '@/shared/api';
import { setLocale, type Locale } from '@/shared/i18n';
import { API_PATHS } from './config';
import { flushAllPending } from './pendingFlush';

// ==== Types ====

export interface AdminUser {
  username: string;
  language: Locale;
}

export type SignedOutReason = 'none' | 'expired' | 'logoutFailed';

export type Session =
  | { status: 'checking' }
  | { status: 'unavailable' }
  | { status: 'signedIn'; user: AdminUser }
  | { status: 'signedOut'; reason: SignedOutReason };

interface UserResponse {
  user: AdminUser;
}

// ==== Store ====

const listeners = new Set<() => void>();

let current: Session = { status: 'checking' };
let started = false;
let epoch = 0;

function notifyListeners() {
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

function getSnapshot(): Session {
  return current;
}

function update(next: Session) {
  current = next;
  notifyListeners();
}

function setSignedIn(user: AdminUser) {
  epoch += 1;
  // The saved admin language wins inside the dashboard (applied once per resolve).
  // Note: setLocale also persists to this device's kuji:locale.
  setLocale(user.language);
  update({ status: 'signedIn', user });
}

async function check() {
  try {
    const { user } = await apiGet<UserResponse>(API_PATHS.me);
    setSignedIn(user);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      update({ status: 'signedOut', reason: 'none' });
    } else {
      update({ status: 'unavailable' });
    }
  }
}

// ==== Public API ====

export function useSession(): Session {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function ensureSession() {
  if (started) return;
  started = true;
  void check();
}

export function retrySession() {
  update({ status: 'checking' });
  void check();
}

export async function signIn(username: string, password: string) {
  const { user } = await apiPost<UserResponse>(API_PATHS.login, { username, password });
  setSignedIn(user);
}

export async function signOut() {
  let reason: SignedOutReason = 'none';
  await flushAllPending(); // commit pending deletes while the cookie is still valid
  try {
    await apiPost(API_PATHS.logout, {});
  } catch {
    reason = 'logoutFailed';
  }
  update({ status: 'signedOut', reason });
}

// Replaces the signed-in user after a settings change. Keeps the epoch and the locale untouched.
export function updateUser(user: AdminUser) {
  if (current.status !== 'signedIn') return;
  update({ status: 'signedIn', user });
}

export function sessionEpoch(): number {
  return epoch;
}

export function expireSession(fromEpoch: number) {
  if (current.status !== 'signedIn' || epoch !== fromEpoch) return;
  update({ status: 'signedOut', reason: 'expired' });
}
