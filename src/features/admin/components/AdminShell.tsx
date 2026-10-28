import { useState, type ReactNode } from "react";
import avatar from "@/assets/avatar.jpg";
import { useStrings } from "@/shared/i18n";
import type { TabId } from "../config";
import { strings } from "../data/strings";
import { signOut } from "../session";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import { TopBar } from "./TopBar";

const styles = {
  shell: "flex h-dvh flex-col lg:flex-row",
  main: "flex min-h-0 min-w-0 flex-1 flex-col",
  view: "animate-reveal-in flex min-h-0 flex-1 flex-col",
};

interface AdminShellProps {
  activeTab: TabId | null;
  children: ReactNode;
}

export function AdminShell({ activeTab, children }: AdminShellProps) {
  const s = useStrings(strings);
  const [loggingOut, setLoggingOut] = useState(false);

  function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    void signOut();
  }

  const logout = loggingOut ? s.loggingOut : s.logout;

  return (
    <div className={styles.shell}>
      <TopBar
        loggingOut={loggingOut}
        onLogout={handleLogout}
        avatarSrc={avatar}
        labels={{ brand: s.brandName, logout }}
      />
      <Sidebar
        activeTab={activeTab}
        loggingOut={loggingOut}
        onLogout={handleLogout}
        avatarSrc={avatar}
        labels={{
          brand: s.brandName,
          nav: s.navLabel,
          tabs: s.tabs,
          logout,
        }}
      />
      <main className={styles.main}>
        <div key={activeTab ?? "not-found"} className={styles.view}>
          {children}
        </div>
      </main>
      <TabBar
        activeTab={activeTab}
        labels={{ nav: s.navLabel, tabs: s.tabs }}
      />
    </div>
  );
}
