import type { IconName } from "@/shared/icons";

export const ADMIN_HOME = "/admin";
export const LOGIN_PATH = "/admin/login";

export const API_PATHS = {
  login: "/admin/login",
  logout: "/admin/logout",
  me: "/admin/me",
};

export const LIMITS = { username: 50, password: 200 };

export const DEFAULT_RETRY_SECONDS = 60;

export const TABS = [
  { id: "reviews", path: "/admin/reviews", icon: "chat" },
  { id: "menu", path: "/admin/menu", icon: "cup" },
  { id: "settings", path: "/admin/settings", icon: "settings" },
] as const satisfies readonly { id: string; path: string; icon: IconName }[];

export type TabId = (typeof TABS)[number]["id"];

export const DEFAULT_TAB_PATH = TABS[0].path;
