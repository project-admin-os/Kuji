import type { Localized } from "@/shared/i18n";

// ==== 1. Branding ====

const brand = {
  name: "Kuji",
};

// ==== 2. Social ====

const social = {
  instagram: {
    name: "Instagram",
    handle: "@kuji.coffee",
    url: "https://www.instagram.com/kuji.coffee",
  },
};

// ==== 3. Branches ====

interface Branch {
  id: string;
  name: Localized<string>;
  mapsUrl: string;
}

const branches: Branch[] = [
  {
    id: "algamaa",
    name: { en: "Hai Algama'a Branch", ar: "فرع حي الجامعة" },
    mapsUrl: "https://bit.ly/3YIzr6p",
  },
  {
    id: "teraa",
    name: { en: "Al Tera'a St. Branch", ar: "فرع شارع الترعة" },
    mapsUrl: "https://bit.ly/3YN5sdq",
  },
];

// ==== Export ====

export const site = { brand, social, branches };
