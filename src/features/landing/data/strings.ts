import type { Localized } from "@/shared/i18n";

const en = {
  taglineLead: "Romanticize your",
  taglineEmphasis: "coffee.",
  footerLead: "Brewed for souls that feel",
  footerEmphasis: "too much.",
  languageName: "عربي",
  switchToLanguage: "Switch to Arabic",
  menuTitle: "Menu",
  menuHint: "Drinks, desserts & offers",
  rateTitle: "Rate us",
  rateHint: "Tell us how it went",
  followUs: "Follow us",
  findUs: "Find us",
  openInMaps: "Open in Maps",
  newTab: "(opens in a new tab)",
};

const ar: typeof en = {
  taglineLead: "اجعل قهوتك",
  taglineEmphasis: "رومانسية.",
  footerLead: "محضّرة لأرواحٍ تشعر",
  footerEmphasis: "بكل شيء.",
  languageName: "English",
  switchToLanguage: "التبديل إلى الإنجليزية",
  menuTitle: "القائمة",
  menuHint: "مشروبات، حلويات وعروض",
  rateTitle: "قيّم تجربتك",
  rateHint: "أخبرنا كيف كانت تجربتك",
  followUs: "تابعنا",
  findUs: "مواقعنا",
  openInMaps: "افتح في الخرائط",
  newTab: "(يُفتح في تبويب جديد)",
};

export const strings: Localized<typeof en> = { en, ar };
