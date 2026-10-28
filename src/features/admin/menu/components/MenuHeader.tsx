import type { MenuData } from "@/features/menu/types";
import type { Locale } from "@/shared/i18n";
import type { MenuAdminStrings } from "../data/strings";

interface MenuHeaderProps {
  draft: MenuData;
  published: MenuData | null;
  dirty: boolean;
  locale: Locale;
  copy: MenuAdminStrings;
}

export function MenuHeader({ draft, published, dirty, locale, copy }: MenuHeaderProps) {
  const timestamp = published?.updatedAt ? Date.parse(published.updatedAt) : NaN;
  const updatedAt = Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp))
    : null;
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="grid gap-1">
        <h1 className="text-heading font-bold text-navy">{copy.title}</h1>
        <p className="max-w-2xl text-small text-navy/60">{copy.intro}</p>
      </div>
      <div className="grid gap-1 text-end">
        <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 text-caption font-bold ${dirty ? "bg-yellow/70 text-navy" : "bg-white text-navy/65"}`}>
          {dirty ? copy.unpublished : published ? `${copy.publishedRevision} ${published.revision}` : copy.noPublished}
        </span>
        {updatedAt && <span className="text-caption text-navy/45">{copy.savedAt}: {updatedAt}</span>}
        <span className="sr-only">{copy.status}: {draft.revision}</span>
      </div>
    </header>
  );
}
