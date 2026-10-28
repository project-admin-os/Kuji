interface NumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  hint?: string;
  step?: number;
  disabled?: boolean;
  id?: string;
  error?: string;
}

export function NumberField({ label, value, onChange, min = 0, max = 99999999, hint, step = 1, disabled = false, id: providedId, error }: NumberFieldProps) {
  const id = providedId ?? `number-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-small font-semibold text-navy">{label}</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => {
          const raw = event.currentTarget.value;
          if (raw === "") onChange(null);
          else {
            const parsed = Number(raw);
            onChange(Number.isSafeInteger(parsed) ? parsed : null);
          }
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`min-h-11 w-full rounded-xl border bg-white px-3 text-small text-navy outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:opacity-50 ${error ? "border-error" : "border-navy/15 focus-visible:border-navy"}`}
      />
      {error && <p id={`${id}-error`} className="text-caption text-error" role="alert">{error}</p>}
      {hint && <p className="text-caption text-navy/55">{hint}</p>}
    </div>
  );
}
