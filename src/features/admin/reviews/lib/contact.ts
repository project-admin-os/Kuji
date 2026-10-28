// Conservative on purpose: anything that doesn't clearly match stays plain text.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s().-]{5,18}[0-9]$/;

export type ContactKind = "email" | "phone" | "text";

export function classifyContact(value: string): ContactKind {
  const trimmed = value.trim();
  if (EMAIL_RE.test(trimmed)) return "email";
  if (PHONE_RE.test(trimmed) && trimmed.replace(/\D/g, "").length >= 6) return "phone";
  return "text";
}

export function contactHref(value: string, kind: ContactKind): string | null {
  const trimmed = value.trim();
  if (kind === "email") return `mailto:${encodeURIComponent(trimmed).replace(/%40/g, "@")}`;
  if (kind === "phone") return `tel:${encodeURIComponent(trimmed.replace(/[\s().-]/g, ""))}`;
  return null;
}
