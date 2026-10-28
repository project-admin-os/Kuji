import { useLocale, setLocale } from "@/shared/i18n";
import { handleInternalClick } from "@/shared/router";
import { Icon } from "@/shared/icons";
import { LanguageToggle } from "@/features/landing/components/LanguageToggle";
import type { MenuStrings } from "../data/strings";

interface HeaderProps {
  strings: MenuStrings;
  onSearch: () => void;
}

export function Header({ strings, onSearch }: HeaderProps) {
  const locale = useLocale();
  const nextLocale = locale === "en" ? "ar" : "en";
  return (
    <header className="relative overflow-hidden bg-navy text-mist">
      <div className="absolute -end-24 -top-32 size-80 rounded-full border border-white/10" aria-hidden="true" />
      <div className="absolute -end-8 -top-16 size-48 rounded-full border border-white/10" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-14 px-5 pb-12 pt-5 sm:px-8 sm:pb-16 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <a href="/" onClick={handleInternalClick} className="inline-flex min-h-11 items-center gap-2 rounded-full font-bold tracking-wide text-yellow">
            <span className="grid size-9 place-items-center rounded-full border border-yellow/40 text-small">K</span>
            <span>{strings.brand}</span>
            <span className="sr-only">{strings.back}</span>
          </a>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-small font-semibold transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow"
              aria-label={strings.search}
            >
              <Icon name="search" className="size-5" />
              <span className="hidden sm:inline">{strings.search}</span>
            </button>
            <LanguageToggle
              label={nextLocale.toUpperCase()}
              ariaLabel={locale === "en" ? "العربية" : "English"}
              lang={nextLocale}
              onClick={() => setLocale(nextLocale)}
            />
          </div>
        </div>
        <div className="max-w-2xl">
          <p className="mb-3 text-caption font-bold uppercase tracking-[0.22em] text-yellow">{strings.menu}</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">{strings.brand}</h1>
          <p className="mt-4 max-w-xl text-body leading-relaxed text-mist/75">{strings.intro}</p>
        </div>
      </div>
    </header>
  );
}
