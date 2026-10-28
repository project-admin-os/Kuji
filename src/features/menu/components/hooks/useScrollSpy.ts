import { useEffect, useState } from "react";

export function useScrollSpy(ids: readonly string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  const stableIds = ids.join("|");

  useEffect(() => {
    const targets = stableIds.split("|").filter(Boolean)
      .map((id) => document.getElementById(`menu-section-${id}`))
      .filter((target): target is HTMLElement => target instanceof HTMLElement);
    if (targets.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
      if (visible?.target instanceof HTMLElement) {
        setActiveId(visible.target.id.replace("menu-section-", ""));
      }
    }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [stableIds]);

  return ids.includes(activeId) ? activeId : ids[0] ?? "";
}
