import type { MenuAdminStrings } from "../data/strings";
import type { MenuSection } from "../types";
import { MENU_SECTIONS } from "../config";

interface SectionSwitcherProps {
  active: MenuSection;
  copy: MenuAdminStrings;
  onChange: (section: MenuSection) => void;
}

export function SectionSwitcher({ active, copy, onChange }: SectionSwitcherProps) {
  return (
    <div role="tablist" aria-label={copy.title} className="flex gap-2 overflow-x-auto rounded-2xl border border-navy/10 bg-white p-2 [scrollbar-width:none]">
      {MENU_SECTIONS.map((section) => (
        <button key={section} type="button" role="tab" aria-selected={active === section} onClick={() => onChange(section)} className={`min-h-10 shrink-0 rounded-xl px-4 text-small font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${active === section ? "bg-navy text-white" : "text-navy/65 hover:bg-mist hover:text-navy"}`}>
          {copy.sections[section]}
        </button>
      ))}
    </div>
  );
}
