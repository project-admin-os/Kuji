import type { Locale } from "@/shared/i18n";

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export function pluralize(count: number, locale: Locale, forms: PluralForms): string {
  const rules = new Intl.PluralRules(locale);
  const category = rules.select(count);
  const template = forms[category] ?? forms.other;
  return template.replace("{count}", count.toLocaleString(locale));
}
