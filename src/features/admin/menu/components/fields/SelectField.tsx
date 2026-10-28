export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  error?: string;
}

export function SelectField({ label, value, options, onChange, disabled = false, id: providedId, error }: SelectFieldProps) {
  const id = providedId ?? `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-small font-semibold text-navy">{label}</label>
      <select id={id} value={value} disabled={disabled} onChange={(event) => onChange(event.currentTarget.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`min-h-11 w-full rounded-xl border bg-white px-3 text-small text-navy outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:opacity-50 ${error ? "border-error" : "border-navy/15 focus-visible:border-navy"}`}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <p id={`${id}-error`} className="text-caption text-error" role="alert">{error}</p>}
    </div>
  );
}
