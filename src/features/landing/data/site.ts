import type { Localized } from "@/shared/i18n";

const brand = {
  name: "Kuji",
};

const social = {
  instagram: {
    name: "Instagram",
    handle: "@kuji.coffee",
    url: "https://www.instagram.com/kuji.coffee",
  },
};

interface Branch {
  id: string;
  name: Localized<string>;
  mapsUrl: string;
}

const branches: Branch[] = [
  {
    id: "algamaa",
    name: { en: "Hai Algama'a Branch", ar: "فرع حي الجامعة" },
    mapsUrl: "https://maps.app.goo.gl/AqECPJkPJjvG1qXB8",
  },
  {
    id: "teraa",
    name: { en: "Al Tera'a St. Branch", ar: "فرع شارع الترعة" },
    mapsUrl: "https://maps.app.goo.gl/MFAmWvbZj8jK2FRV6",
  },
];

export const site = { brand, social, branches };
