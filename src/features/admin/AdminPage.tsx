import { useEffect, useRef } from "react";
import { useStrings } from "@/shared/i18n";
import { navigate, usePath } from "@/shared/router";
import { Background } from "./components/Background";
import { AdminShell } from "./components/AdminShell";
import { useNoindex } from "./components/hooks/useNoindex";
import { NotFound } from "./components/NotFound";
import { StatusScreen } from "./components/StatusScreen";
import { TabPlaceholder } from "./components/TabPlaceholder";
import { ADMIN_HOME, DEFAULT_TAB_PATH, LOGIN_PATH, TABS } from "./config";
import { strings } from "./data/strings";
import { LoginPage } from "./LoginPage";
import { ensureSession, retrySession, useSession } from "./session";
import { ReviewsTab } from "./reviews/ReviewsTab";
import { SettingsTab } from "./settings/SettingsTab";

type Tab = (typeof TABS)[number];

type Route =
  | { kind: "login" }
  | { kind: "index" }
  | { kind: "tab"; tab: Tab }
  | { kind: "notFound" };

const styles = {
  page: "relative isolate min-h-dvh",
};

function matchRoute(path: string): Route {
  if (path === LOGIN_PATH) return { kind: "login" };
  if (path === ADMIN_HOME) return { kind: "index" };
  const tab = TABS.find((item) => item.path === path);
  return tab ? { kind: "tab", tab } : { kind: "notFound" };
}

export function AdminPage() {
  useNoindex();

  useEffect(() => {
    ensureSession();
  }, []);

  return (
    <div className={styles.page}>
      <Background />
      <AdminScreens />
    </div>
  );
}

function AdminScreens() {
  const s = useStrings(strings);
  const path = usePath();
  const session = useSession();
  const returnTo = useRef<string | null>(null);

  const route = matchRoute(path);
  const status = session.status;

  useEffect(() => {
    if (status === "signedOut" && route.kind !== "login") {
      if (route.kind === "tab") returnTo.current = path;
      navigate(LOGIN_PATH, { replace: true });
    } else if (
      status === "signedIn" &&
      (route.kind === "login" || route.kind === "index")
    ) {
      navigate(returnTo.current ?? DEFAULT_TAB_PATH, { replace: true });
      returnTo.current = null;
    }
  }, [status, route.kind, path]);

  if (session.status === "checking")
    return <StatusScreen message={s.checking} />;

  if (session.status === "unavailable") {
    return (
      <StatusScreen
        message={s.unavailable}
        retryLabel={s.retry}
        onRetry={retrySession}
      />
    );
  }

  if (session.status === "signedOut") {
    return (
      <LoginPage notice={session.reason === "none" ? null : session.reason} />
    );
  }

  if (route.kind === "login" || route.kind === "index") {
    return <StatusScreen message={s.checking} />;
  }

  if (route.kind === "tab") {
    const { tab } = route;
    return (
      <AdminShell activeTab={tab.id}>
        {tab.id === "reviews" ? (
          <ReviewsTab />
        ) : tab.id === "settings" ? (
          <SettingsTab />
        ) : (
          <TabPlaceholder
            icon={tab.icon}
            title={s.tabs[tab.id]}
            hint={s.tabHints[tab.id]}
            badge={s.comingSoon}
          />
        )}
      </AdminShell>
    );
  }

  return (
    <AdminShell activeTab={null}>
      <NotFound
        title={s.notFoundTitle}
        hint={s.notFoundHint}
        actionLabel={s.notFoundAction}
        actionHref={DEFAULT_TAB_PATH}
      />
    </AdminShell>
  );
}
