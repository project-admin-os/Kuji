import type { L10n, MenuIssue } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";

interface L10nFieldProps {
  label: string;
  value: L10n;
  onChange: (value: L10n) => void;
  path: string;
  issues: MenuIssue[];
  copy: MenuAdminStrings;
  multiline?: boolean;
  maxLength?: number;
  required?: boolean;
}

function issueMessage(issues: MenuIssue[], path: string, copy: MenuAdminStrings) {
  const issue = issues.find((entry) => entry.path === path);
  if (!issue) return null;
  if (issue.code === "required") return copy.fieldRequired;
  if (issue.code === "too_long") return copy.fieldTooLong;
  if (issue.code === "reference") return copy.referenceInvalid;
  return copy.fieldInvalid;
}

export function L10nField({ label, value, onChange, path, issues, copy, multiline = false, maxLength, required = false }: L10nFieldProps) {
  const Field = multiline ? "textarea" : "input";
  return (
    <fieldset className="grid gap-3">
      <legend className="text-small font-semibold text-navy">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["en", "ar"] as const).map((language) => {
          const fieldPath = `${path}.${language}`;
          const error = issueMessage(issues, fieldPath, copy);
          const id = `${path.replaceAll(".", "-")}-${language}`;
          return (
            <div key={language} className="grid gap-1.5">
              <label htmlFor={id} className="text-caption font-medium text-navy/60">{language === "en" ? "English" : "العربية"}</label>
              <Field
                id={id}
                value={value[language]}
                dir={language === "ar" ? "rtl" : "ltr"}
                required={required}
                maxLength={maxLength}
                rows={multiline ? 3 : undefined}
                onChange={(event) => onChange({ ...value, [language]: event.currentTarget.value })}
                className={`min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-small text-navy outline-none transition focus-visible:ring-2 focus-visible:ring-navy ${error ? "border-error" : "border-navy/15 focus-visible:border-navy"}`}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
              />
              {error && <p id={`${id}-error`} className="text-caption text-error">{error}</p>}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
