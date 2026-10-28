import { USERNAME_RULES } from "../config";

export type UsernameIssue = "tooShort" | "tooLong" | "chars";

const ALLOWED = /^[a-z0-9._-]+$/;

// The server lowercases too; doing it here keeps the field honest.
export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function usernameIssue(value: string): UsernameIssue | null {
  if (value.length > USERNAME_RULES.max) return "tooLong";
  if (value !== "" && !ALLOWED.test(value)) return "chars";
  if (value.length < USERNAME_RULES.min) return "tooShort";
  return null;
}
