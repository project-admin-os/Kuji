import wordmark from "@/assets/wordmark.png";
import { Icon } from "@/shared/icons";
import { handleInternalClick } from "@/shared/router";
import { TABS, type TabId } from "../config";

const WORDMARK_WIDTH = 190;
const WORDMARK_HEIGHT = 112;
const AVATAR_SIZE = 80;
const styles = {
  sidebar:
    // Replaced lg:m-4 with lg:my-4 lg:ms-2 lg:me-4 to push it closer to the screen edge
    "sticky top-4 hidden h-[calc(100vh-2rem)] w-56 shrink-0 flex-col gap-6 rounded-sheet border border-white/70 bg-white/80 px-4 py-6 lg:my-4 lg:ms-2 lg:me-4 lg:flex",
  brand: "flex flex-col items-center gap-4 px-2 text-center",
  avatar: "size-16 rounded-full object-cover ring-2 ring-navy",
  wordmark: "h-8 w-auto",
  nav: "flex flex-col gap-1",
  link: "text-small flex min-h-12 items-center gap-3 rounded-lg px-4 font-bold transition active:scale-[0.98]",
  linkActive: "bg-navy text-white",
  linkIdle: "text-navy/75 hover:bg-white",
  icon: "size-5 shrink-0",
  iconActive: "text-yellow",
  footer: "mt-auto",
  logout:
    "text-small inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-navy/15 bg-white px-5 font-bold transition hover:bg-arctic/50 active:scale-[0.98] disabled:opacity-40",
  logoutIcon: "size-5",
};

interface SidebarProps {
  activeTab: TabId | null;
  loggingOut: boolean;
  onLogout: () => void;
  avatarSrc: string;
  labels: {
    brand: string;
    nav: string;
    tabs: Record<TabId, string>;
    logout: string;
  };
}

export function Sidebar({
  activeTab,
  loggingOut,
  onLogout,
  avatarSrc,
  labels,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <header className={styles.brand}>
        <img
          src={avatarSrc}
          alt=""
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          fetchPriority="high"
          decoding="async"
          className={styles.avatar}
        />
        <img
          src={wordmark}
          alt={labels.brand}
          width={WORDMARK_WIDTH}
          height={WORDMARK_HEIGHT}
          decoding="async"
          className={styles.wordmark}
        />
      </header>

      <nav aria-label={labels.nav} className={styles.nav}>
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
              <Icon
                name={tab.icon}
                className={`${styles.icon} ${active ? styles.iconActive : ""}`}
              />
              {labels.tabs[tab.id]}
            </a>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className={styles.logout}
        >
          <Icon name="logout" className={styles.logoutIcon} />
          {labels.logout}
        </button>
      </div>
    </aside>
  );
}
