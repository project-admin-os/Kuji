/**
 * Tiny router (no library). Uses the browser History API.
 *
 * USE:
 *   const path = usePath();                          // read the current path
 *   <a href="/menu" onClick={handleInternalClick}>   // internal link, no page reload
 *   navigate('/menu');                               // go somewhere from code
 *   navigate('/admin', { replace: true });           // redirect without adding a Back entry
 *
 * RULES:
 *   - Only use handleInternalClick on links that start with "/".
 *     External links (Instagram, Maps) are plain <a> tags with no onClick.
 *   - Never call window.history.pushState yourself. Always use navigate().
 */

import { useSyncExternalStore, type MouseEvent } from 'react';

// ==== Store ====

const listeners = new Set<() => void>();

function currentPath(): string {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

function notifyListeners() {
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

window.addEventListener('popstate', notifyListeners);

// ==== Helpers ====

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function isInternalLink(link: HTMLAnchorElement): boolean {
  const href = link.getAttribute('href');
  return (
    !!href &&
    href.startsWith('/') &&
    !href.startsWith('//') &&
    (!link.target || link.target === '_self') &&
    !link.hasAttribute('download')
  );
}

// ==== Public API ====

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath);
}

export function navigate(path: string, options: { replace?: boolean } = {}) {
  if (path === currentPath()) return;
  if (options.replace) window.history.replaceState(null, '', path);
  else window.history.pushState(null, '', path);
  window.scrollTo(0, 0);
  notifyListeners();
}

export function handleInternalClick(event: MouseEvent<HTMLAnchorElement>) {
  if (isModifiedClick(event) || !isInternalLink(event.currentTarget)) return;
  event.preventDefault();
  navigate(event.currentTarget.getAttribute('href')!);
}