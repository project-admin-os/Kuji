export const PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;
export type PerPage = (typeof PER_PAGE_OPTIONS)[number];

export const DEFAULT_PER_PAGE: PerPage = 20;
export const PER_PAGE_STORAGE_KEY = "kuji:admin:reviews:perPage";

export const UNDO_WINDOW_MS = 5_000;
export const MAX_PENDING_DELETES = 100;

export const STALE_AFTER_MS = 60_000;
export const MESSAGE_CLAMP_LINES = 3;
