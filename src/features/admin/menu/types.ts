import type { MenuData, MenuIssue } from "@/features/menu/types";

export type MenuSection = "products" | "categories" | "addons" | "featured" | "popup";
export type MenuLoadStatus = "loading" | "ready" | "error";

export interface MenuDraftSnapshot {
  status: MenuLoadStatus;
  draft: MenuData;
  published: MenuData | null;
  baseRevision: number;
  dirty: boolean;
  saving: boolean;
  issues: MenuIssue[];
  loadError: string | null;
  conflictOpen: boolean;
  conflictRevision: number | null;
  conflictMenu: MenuData | null;
}

export type PublishOutcome =
  | { status: "saved" }
  | { status: "invalid" }
  | { status: "conflict" }
  | { status: "error"; error: unknown };
