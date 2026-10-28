import { useSyncExternalStore } from "react";
import { getMenuDraftSnapshot, subscribeMenuDraft } from "../menuDraft";

export function useMenuDraft() {
  return useSyncExternalStore(subscribeMenuDraft, getMenuDraftSnapshot, getMenuDraftSnapshot);
}
