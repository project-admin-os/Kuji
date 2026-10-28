import { useSyncExternalStore } from "react";
import { ApiError, apiGet } from "@/shared/api";
import { MENU_API, MENU_CACHE_KEY, MENU_REVALIDATE_AFTER_MS } from "./config";
import { seedMenu } from "./data/seed";
import type { MenuApiResponse, MenuData } from "./types";
import { isMenuData } from "./lib/validate";

export type MenuSource = "seed" | "cache" | "server";

export interface MenuSnapshot {
  menu: MenuData;
  source: MenuSource;
  refreshing: boolean;
  refreshFailed: boolean;
  unpublished: boolean;
}

interface CachedMenu {
  savedAt: number;
  menu: MenuData;
}

const listeners = new Set<() => void>();
let lastRefreshAt = 0;
let refreshPromise: Promise<void> | null = null;
let started = false;

function readCache(): MenuData | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(MENU_CACHE_KEY) ?? "null");
    if (typeof parsed !== "object" || parsed === null || !("menu" in parsed)) return null;
    const cache = parsed as CachedMenu;
    return isMenuData(cache.menu) ? cache.menu : null;
  } catch {
    return null;
  }
}

const cachedMenu = readCache();
let current: MenuSnapshot = {
  menu: cachedMenu ?? seedMenu,
  source: cachedMenu ? "cache" : "seed",
  refreshing: false,
  refreshFailed: false,
  unpublished: false,
};

function notify(): void {
  listeners.forEach((listener) => listener());
}

function update(next: MenuSnapshot): void {
  current = next;
  notify();
}

export async function refreshMenu(force = false): Promise<void> {
  if (refreshPromise) return refreshPromise;
  if (!force && Date.now() - lastRefreshAt < MENU_REVALIDATE_AFTER_MS) return;

  lastRefreshAt = Date.now();
  update({ ...current, refreshing: true, refreshFailed: false });
  refreshPromise = (async () => {
    try {
      const response = await apiGet<MenuApiResponse>(MENU_API.public);
      if (!response?.ok || !isMenuData(response.menu)) throw new Error("Invalid menu response");
      try {
        localStorage.setItem(MENU_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), menu: response.menu } satisfies CachedMenu));
      } catch {
        // The network response remains usable when browser storage is unavailable.
      }
      update({ menu: response.menu, source: "server", refreshing: false, refreshFailed: false, unpublished: false });
    } catch (error) {
      const unpublished = error instanceof ApiError && error.status === 404 && error.code === "menu_not_published";
      update({ ...current, refreshing: false, refreshFailed: !unpublished, unpublished });
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!started) {
    started = true;
    void refreshMenu(true);
  }
  return () => listeners.delete(listener);
}

function getSnapshot(): MenuSnapshot {
  return current;
}

export function useMenu(): MenuSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() - lastRefreshAt >= MENU_REVALIDATE_AFTER_MS) {
      void refreshMenu();
    }
  });
}
