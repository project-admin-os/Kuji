import { Icon } from "@/shared/icons";
import { handleInternalClick } from "@/shared/router";
import { TABS, type TabId } from "../config";

const styles = {
  bar: "flex shrink-0 border-t border-white/70 bg-white/80 pb-[env(safe-area-inset-bottom)] lg:hidden",
  link: "text-caption flex min-h-16 flex-1 flex-col items-center justify-center gap-1 font-bold transition active:scale-[0.97]",
  linkActive: "text-navy",
  linkIdle: "text-navy/65",
  pill: "flex h-8 w-14 items-center justify-center rounded-full transition",
  pillActive: "bg-navy text-yellow",
  icon: "size-5",
};

interface TabBarProps {
  activeTab: TabId | null;
  labels: { nav: string; tabs: Record<TabId, string> };
}

export function TabBar({ activeTab, labels }: TabBarProps) {
  return (
    <nav aria-label={labels.nav} className={styles.bar}>
      {TABS.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <a
            key={tab.id}
            href={tab.path}
            onClick={handleInternalClick}
            aria-current={active ? "page" : undefined}
            className={`${styles.link} ${active ? styles.linkActive : styles.linkIdle}`}
          >
            <span className={`${styles.pill} ${active ? styles.pillActive : ""}`}>
              <Icon name={tab.icon} className={styles.icon} />
            </span>
            {labels.tabs[tab.id]}
          </a>
        );
      })}
    </nav>
  );
}
