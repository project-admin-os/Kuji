import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/shared/i18n";
import { strings as adminStrings } from "../../data/strings";
import { discardMenuDraft } from "../menuDraft";
import { useMenuDraft } from "./useMenuDraft";

export function useUnsavedGuard() {
  const locale = useLocale();
  const { dirty } = useMenuDraft();
  const [open, setOpen] = useState(false);
  const logoutButton = useRef<HTMLButtonElement | null>(null);
  const allowNextLogout = useRef(false);

  useEffect(() => {
    if (!dirty) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const labels = new Set([
      adminStrings.en.logout,
      adminStrings.en.loggingOut,
      adminStrings.ar.logout,
      adminStrings.ar.loggingOut,
    ]);
    const guardLogout = (event: MouseEvent) => {
      if (allowNextLogout.current) {
        allowNextLogout.current = false;
        return;
      }
      const target = event.target;
      const button = target instanceof Element ? target.closest("button") : null;
      if (!(button instanceof HTMLButtonElement) || button.disabled) return;
      const label = (button.textContent ?? "").replace(/\s+/g, " ").trim();
      if (!labels.has(label)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      logoutButton.current = button;
      setOpen(true);
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", guardLogout, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", guardLogout, true);
    };
  }, [dirty]);

  const cancel = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => logoutButton.current?.focus());
  }, []);

  const confirm = useCallback(() => {
    const button = logoutButton.current;
    discardMenuDraft();
    setOpen(false);
    window.requestAnimationFrame(() => {
      if (!button || !button.isConnected) return;
      allowNextLogout.current = true;
      button.click();
    });
  }, []);

  return { open, cancel, confirm, locale };
}
