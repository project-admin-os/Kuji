export interface RelationOption {
  id: string;
  label: string;
  disabled?: boolean;
}

interface RelationPickerProps {
  label: string;
  options: RelationOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  emptyLabel?: string;
}

export function RelationPicker({ label, options, selected, onChange, emptyLabel }: RelationPickerProps) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-small font-semibold text-navy">{label}</legend>
      {options.length === 0 ? <p className="text-caption text-navy/55">{emptyLabel}</p> : (
        <div className="grid max-h-48 gap-1 overflow-y-auto rounded-xl border border-navy/10 bg-white p-2 sm:grid-cols-2">
          {options.map((option) => {
            const checked = selected.includes(option.id);
            return (
              <label key={option.id} className={`flex min-h-10 items-center gap-2 rounded-lg px-2 text-small text-navy ${option.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-mist"}`}>
                <input type="checkbox" checked={checked} disabled={option.disabled} onChange={(event) => onChange(event.currentTarget.checked ? [...selected, option.id] : selected.filter((id) => id !== option.id))} className="size-4 accent-navy" />
                <span className="truncate">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
