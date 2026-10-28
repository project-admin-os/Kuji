import { useCallback, useState } from "react";
import type { MenuData, MenuProduct } from "../../types";
import { availableAddOns } from "../../lib/options";

export function useOptions(product: MenuProduct, menu: MenuData) {
  const [selected, setSelected] = useState<string[]>([]);
  const available = availableAddOns(product, menu);
  const toggle = useCallback((id: string) => {
    setSelected((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }, []);
  return { selected, toggle, available };
}
