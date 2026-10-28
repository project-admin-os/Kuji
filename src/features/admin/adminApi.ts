import { apiGet, apiPost, ApiError } from "@/shared/api";
import type { Locale } from "@/shared/i18n";
import { SETTINGS_PATHS } from "./settings/config";
import { expireSession, sessionEpoch, type AdminUser } from "./session";

async function guard<T>(call: (fromEpoch: number) => Promise<T>): Promise<T> {
  const fromEpoch = sessionEpoch();
  try {
    return await call(fromEpoch);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      expireSession(fromEpoch);
    throw error;
  }
}

export function adminGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return guard(() => apiGet<T>(path, signal));
}

export function adminPost<T = unknown>(
  path: string,
  body: unknown,
): Promise<T> {
  return guard(() => apiPost<T>(path, body));
}

// ==== Reviews ====


export interface ReviewItem {
  id: number;
  name: string;
  contact: string;
  message: string;
  created_at: string;
}

export interface ReviewsPage {
  ok: true;
  items: ReviewItem[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export function fetchReviews(
  page: number,
  perPage: number,
  signal?: AbortSignal,
): Promise<ReviewsPage> {
  return adminGet<ReviewsPage>(
    `/admin/feedback?page=${page}&per_page=${perPage}`,
    signal,
  );
}

export interface DeleteReviewsResult {
  ok: boolean;
  deleted: number;
}

// Permanent. IDs that no longer exist are not an error (deleted may be < ids.length).
export async function deleteReviews(ids: number[]): Promise<DeleteReviewsResult> {
  const result = await adminPost<DeleteReviewsResult>("/admin/feedback/delete", { ids });
  if (!result.ok) throw new ApiError(500, "Delete failed");
  return result;
}

// ==== Settings ====

interface UserResult {
  ok: boolean;
  user?: AdminUser;
}

async function saveForUser(path: string, body: unknown): Promise<AdminUser> {
  const result = await adminPost<UserResult>(path, body);
  if (!result.ok || !result.user) throw new ApiError(500, "Save failed");
  return result.user;
}

export function saveLanguage(language: Locale): Promise<AdminUser> {
  return saveForUser(SETTINGS_PATHS.language, { language });
}

export function saveUsername(username: string): Promise<AdminUser> {
  return saveForUser(SETTINGS_PATHS.username, { username });
}

export async function savePassword(newPassword: string): Promise<void> {
  const result = await adminPost<{ ok: boolean }>(SETTINGS_PATHS.password, {
    new_password: newPassword,
  });
  if (!result.ok) throw new ApiError(500, "Save failed");
}
