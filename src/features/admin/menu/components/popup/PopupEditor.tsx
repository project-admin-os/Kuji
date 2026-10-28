import type { Locale } from "@/shared/i18n";
import { localized } from "@/features/menu/lib/i18n";
import type { MenuIssue, MenuPopup } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { L10nField } from "../fields/L10nField";
import { NumberField } from "../fields/NumberField";
import { Toggle } from "../fields/Toggle";
import { UrlField } from "../fields/UrlField";

interface PopupEditorProps {
  popup: MenuPopup;
  locale: Locale;
  copy: MenuAdminStrings;
  issues: MenuIssue[];
  onChange: (popup: MenuPopup) => void;
}

export function PopupEditor({ popup, locale, copy, issues, onChange }: PopupEditorProps) {
  const update = (patch: Partial<MenuPopup>) => onChange({ ...popup, ...patch });
  const title = localized(popup.title, locale) || copy.popupTitle;
  const delayIssue = issues.some((issue) => issue.path === "popup.delaySeconds");
  return (
    <section className="grid gap-5 rounded-2xl border border-navy/10 bg-white p-4 shadow-card sm:p-6">
      <div><h3 className="text-subheading font-bold text-navy">{title}</h3><p className="mt-1 text-small text-navy/55">{copy.popupHint}</p></div>
      <Toggle checked={popup.enabled} onChange={(enabled) => update({ enabled })} label={copy.popupEnabled} />
      <L10nField label={copy.popupTitle} value={popup.title} onChange={(titleValue) => update({ title: titleValue })} path="popup.title" issues={issues} copy={copy} maxLength={60} required={popup.enabled} />
      <L10nField label={copy.popupBody} value={popup.body} onChange={(body) => update({ body })} path="popup.body" issues={issues} copy={copy} maxLength={240} multiline required={popup.enabled} />
      <L10nField label={copy.ctaLabel} value={popup.ctaLabel} onChange={(ctaLabel) => update({ ctaLabel })} path="popup.ctaLabel" issues={issues} copy={copy} maxLength={30} required={popup.enabled} />
      <UrlField label={copy.image} value={popup.image} onChange={(image) => update({ image })} path="popup.image" issues={issues} copy={copy} hint={copy.urlHint} />
      <UrlField label={copy.ctaUrl} value={popup.ctaUrl} onChange={(ctaUrl) => update({ ctaUrl })} path="popup.ctaUrl" issues={issues} copy={copy} hint={copy.urlHint} />
      <NumberField id="popup-delay" label={copy.delaySeconds} value={popup.delaySeconds} onChange={(delaySeconds) => update({ delaySeconds: delaySeconds ?? 5 })} min={1} max={20} error={delayIssue ? copy.fieldInvalid : undefined} />
    </section>
  );
}
