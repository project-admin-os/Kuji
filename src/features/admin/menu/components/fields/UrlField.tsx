import type { MenuAdminStrings } from "../../data/strings";
import type { MenuIssue } from "@/features/menu/types";

interface UrlFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  path: string;
  issues: MenuIssue[];
  copy: MenuAdminStrings;
  hint?: string;
}

export function UrlField({ label, value, onChange, path, issues, copy, hint }: UrlFieldProps) {
  const id = path.replaceAll(".", "-");
  const issue = issues.find((entry) => entry.path === path);
  const message = issue?.code === "too_long" ? copy.fieldTooLong : issue ? copy.fieldInvalid : null;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-small font-semibold text-navy">{label}</label>
      <input id={id} type="text" value={value} onChange={(event) => onChange(event.currentTarget.value)} maxLength={2048} className={`min-h-11 w-full rounded-xl border bg-white px-3 text-small text-navy outline-none focus-visible:ring-2 focus-visible:ring-navy ${message ? "border-error" : "border-navy/15 focus-visible:border-navy"}`} aria-invalid={Boolean(message)} />
      {message && <p className="text-caption text-error">{message}</p>}
      {hint && <p className="text-caption text-navy/55">{hint}</p>}
    </div>
  );
}
