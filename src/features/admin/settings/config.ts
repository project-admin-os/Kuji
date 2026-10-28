import type { Locale } from "@/shared/i18n";

export const SETTINGS_PATHS = {
  language: "/admin/settings/language",
  username: "/admin/settings/username",
  password: "/admin/settings/password",
};

// Mirrors the server rules; the server stays the authority.
export const USERNAME_RULES = { min: 3, max: 50 };
export const PASSWORD_RULES = { minBytes: 10, maxBytes: 72 };

export const SUCCESS_VISIBLE_MS = 5000;

// Always shown in their own language, never translated.
export const LANGUAGE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "ar", label: "العربية" },
] as const satisfies readonly { id: Locale; label: string }[];
