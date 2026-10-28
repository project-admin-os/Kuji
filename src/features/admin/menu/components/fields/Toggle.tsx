interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, hint, disabled = false }: ToggleProps) {
  return (
    <label className={`flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl border border-navy/10 bg-white px-4 py-3 ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
      <span className="grid gap-1">
        <span className="text-small font-semibold text-navy">{label}</span>
        {hint && <span className="text-caption text-navy/55">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(event) => onChange(event.currentTarget.checked)} className="size-5 accent-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2" />
    </label>
  );
}
