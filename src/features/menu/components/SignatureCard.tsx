import type { Locale } from "@/shared/i18n";
import type { MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { ListCard } from "./ListCard";

interface SignatureCardProps {
  product: MenuProduct;
  locale: Locale;
  strings: MenuStrings;
  onSelect: (product: MenuProduct) => void;
}

export function SignatureCard(props: SignatureCardProps) {
  return <ListCard {...props} featured />;
}
