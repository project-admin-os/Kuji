import { ApiError } from "@/shared/api";
import { seedMenu } from "@/features/menu/data/seed";
import { validateMenu } from "@/features/menu/lib/validate";
import type { MenuData, MenuIssue } from "@/features/menu/types";
import { fetchAdminMenu, saveAdminMenu } from "../adminApi";
import type { MenuDraftSnapshot, PublishOutcome } from "./types";

function cloneMenu(menu: MenuData): MenuData {
  return structuredClone(menu);
}

function sameMenu(left: MenuData, right: MenuData): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

const listeners = new Set<() => void>();
let current: MenuDraftSnapshot = {
  status: "loading",
  draft: cloneMenu(seedMenu),
  published: null,
  baseRevision: 0,
  dirty: false,
  saving: false,
  issues: [],
  loadError: null,
  conflictOpen: false,
  conflictRevision: null,
  conflictMenu: null,
};
let loaded = false;
let loadPromise: Promise<void> | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function commit(next: MenuDraftSnapshot) {
  current = next;
  notify();
}

export function subscribeMenuDraft(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMenuDraftSnapshot(): MenuDraftSnapshot {
  return current;
}

export async function loadMenuDraft(force = false): Promise<void> {
  if (loadPromise) return loadPromise;
  if (loaded && !force) return;

  commit({ ...current, status: "loading", loadError: null });
  loadPromise = (async () => {
    try {
      const published = await fetchAdminMenu();
      const draft = cloneMenu(published ?? seedMenu);
      commit({
        ...current,
        status: "ready",
        draft,
        published: published ? cloneMenu(published) : null,
        baseRevision: published?.revision ?? 0,
        dirty: false,
        saving: false,
        issues: [],
        loadError: null,
        conflictOpen: false,
        conflictRevision: null,
        conflictMenu: null,
      });
      loaded = true;
    } catch (error) {
      commit({ ...current, status: "error", loadError: error instanceof Error ? error.message : "Menu load failed" });
      loaded = false;
    }
  })().finally(() => {
    loadPromise = null;
  });
  return loadPromise;
}

export function updateMenuDraft(update: (menu: MenuData) => MenuData): void {
  const draft = update(cloneMenu(current.draft));
  const baseline = current.published ?? seedMenu;
  const issues = validateMenu(draft);
  commit({ ...current, draft, dirty: !sameMenu(draft, baseline), issues });
}

export function importStarterMenu(): void {
  updateMenuDraft(() => cloneMenu(seedMenu));
}

export function discardMenuDraft(): void {
  const draft = cloneMenu(current.published ?? seedMenu);
  commit({ ...current, draft, dirty: false, issues: [], conflictOpen: false, conflictRevision: null, conflictMenu: null });
}

export function setMenuIssues(issues: MenuIssue[]): void {
  commit({ ...current, issues });
}

export async function publishMenuDraft(): Promise<PublishOutcome> {
  if (current.saving) return { status: "error", error: new Error("A publish request is already in progress") };
  const issues = validateMenu(current.draft);
  if (issues.length > 0) {
    commit({ ...current, issues });
    return { status: "invalid" };
  }

  const revision = current.baseRevision;
  const draft = cloneMenu(current.draft);
  commit({ ...current, saving: true, issues: [] });
  try {
    const saved = await saveAdminMenu(revision, draft);
    commit({
      ...current,
      status: "ready",
      draft: cloneMenu(saved),
      published: cloneMenu(saved),
      baseRevision: saved.revision,
      dirty: false,
      saving: false,
      issues: [],
      conflictOpen: false,
      conflictRevision: null,
      conflictMenu: null,
    });
    loaded = true;
    return { status: "saved" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      let latest: MenuData | null = null;
      try {
        latest = await fetchAdminMenu();
      } catch {
        latest = null;
      }
      commit({
        ...current,
        saving: false,
        conflictOpen: true,
        conflictRevision: latest?.revision ?? null,
        conflictMenu: latest ? cloneMenu(latest) : null,
      });
      return { status: "conflict" };
    }
    if (error instanceof ApiError && error.status === 422) {
      const serverIssues = validateMenu(current.draft);
      const mappedIssues = serverIssues.length > 0 ? serverIssues : [{ path: "", code: "server_invalid" }];
      commit({ ...current, saving: false, issues: mappedIssues });
      return { status: "invalid" };
    }
    commit({ ...current, saving: false });
    return { status: "error", error };
  }
}

export async function reloadLatestMenu(): Promise<void> {
  commit({ ...current, status: "loading", loadError: null });
  try {
    const published = await fetchAdminMenu();
    const draft = cloneMenu(published ?? seedMenu);
    commit({
      ...current,
      status: "ready",
      draft,
      published: published ? cloneMenu(published) : null,
      baseRevision: published?.revision ?? 0,
      dirty: false,
      saving: false,
      issues: [],
      conflictOpen: false,
      conflictRevision: null,
      conflictMenu: null,
    });
    loaded = true;
  } catch (error) {
    commit({ ...current, status: "error", loadError: error instanceof Error ? error.message : "Menu reload failed" });
  }
}

export function keepMenuDraft(): void {
  commit({ ...current, conflictOpen: false });
}
