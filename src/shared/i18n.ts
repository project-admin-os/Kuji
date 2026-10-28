import { useSyncExternalStore } from 'react';

// ==== Types ====

export type Locale = 'en' | 'ar';
export type Localized<T> = Record<Locale, T>;

// ==== Constants ====

const STORAGE_KEY = 'kuji:locale';

// ==== Store ====

const listeners = new Set<() => void>();

function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ar';
}

function readInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // Storage blocked: use the browser language instead.
  }
  return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

function applyToDocument(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

let current: Locale = readInitialLocale();
applyToDocument(current); 

function notifyListeners() {
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

function getSnapshot(): Locale {
  return current;
}

// ==== Public API ====

export function setLocale(locale: Locale) {
  if (locale === current) return;
  current = locale;
  applyToDocument(locale);
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Not fatal: the choice just won't be remembered.
  }
  notifyListeners();
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useStrings<T>(table: Localized<T>): T {
  return table[useLocale()];
}