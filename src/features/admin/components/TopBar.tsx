import wordmark from "@/assets/wordmark.png";
import { Icon } from "@/shared/icons";

const WORDMARK_WIDTH = 190;
const WORDMARK_HEIGHT = 112;
const AVATAR_SIZE = 40;

const styles = {
  bar: "flex shrink-0 items-center gap-3 border-b border-white/70 bg-white/60 ps-4 pe-2 pt-[max(0.25rem,env(safe-area-inset-top))] pb-1 lg:hidden",
  avatar: "size-9 rounded-full object-cover ring-2 ring-navy",
  wordmark: "h-8 w-auto shrink-0",
  logout:
    "ms-auto inline-flex size-12 shrink-0 items-center justify-center rounded-full transition hover:bg-white active:scale-95 disabled:opacity-40",
  logoutIcon: "size-5",
};

interface TopBarProps {
  loggingOut: boolean;
  onLogout: () => void;
  avatarSrc: string;
  labels: { brand: string; logout: string };
}

export function TopBar({
  loggingOut,
  onLogout,
  avatarSrc,
  labels,
}: TopBarProps) {
  return (
    <header className={styles.bar}>
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
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        aria-label={labels.logout}
        className={styles.logout}
      >
        <Icon name="logout" className={styles.logoutIcon} />
      </button>
    </header>
  );
}
