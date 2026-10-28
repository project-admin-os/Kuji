import type { Locale } from "@/shared/i18n";
import type { MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { SignatureCard } from "./SignatureCard";

interface SignaturesSectionProps {
  products: MenuProduct[];
  locale: Locale;
  strings: MenuStrings;
  onSelect: (product: MenuProduct) => void;
}

export function SignaturesSection({ products, locale, strings, onSelect }: SignaturesSectionProps) {
  if (products.length === 0) return null;
  return (
    <section className="py-8" aria-labelledby="menu-signatures-title">
      <div className="mb-4 flex items-end justify-between">
        <h2 id="menu-signatures-title" className="text-title font-bold text-navy">{strings.signatures}</h2>
        <span className="text-caption font-semibold text-navy/45">{products.length}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => <SignatureCard key={product.id} product={product} locale={locale} strings={strings} onSelect={onSelect} />)}
      </div>
    </section>
  );
}
