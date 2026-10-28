import { useEffect, useRef } from "react";

interface Shortcuts {
  enabled: boolean; // desktop, no confirm dialog open
  panelOpen: boolean;
  hasSelection: boolean;
  move: (delta: 1 | -1) => void;
  toggleActive: (range: boolean) => void;
  deleteCurrent: () => void;
  selectAll: () => void;
  clearSelection: () => void;
}

// Skip when typing, or when a control other than a row has focus (it owns Space/Enter).
function ignoreTarget(target: HTMLElement | null): boolean {
  if (!target) return false;
  if (target.isContentEditable) return true;
  return /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(target.tagName);
}

export function useReviewShortcuts(shortcuts: Shortcuts) {
  const ref = useRef(shortcuts);
  useEffect(() => {
    ref.current = shortcuts;
  });

  useEffect(() => {
    if (!shortcuts.enabled) return;
    function onKeyDown(event: KeyboardEvent) {
      const o = ref.current;
      const target = event.target as HTMLElement | null;
      if (event.altKey || event.defaultPrevented) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
        event.preventDefault();
        o.selectAll();
        return;
      }
      if (event.ctrlKey || event.metaKey || ignoreTarget(target)) return;

      switch (event.key) {
        case "ArrowDown":
        case "j":
          event.preventDefault();
          o.move(1);
          break;
        case "ArrowUp":
        case "k":
          event.preventDefault();
          o.move(-1);
          break;
        case " ":
          if (o.panelOpen) return;
          event.preventDefault();
          o.toggleActive(event.shiftKey);
          break;
        case "Delete":
        case "Backspace":
          event.preventDefault();
          o.deleteCurrent();
          break;
        case "Escape":
          // The open panel handles its own Esc first.
          if (!o.panelOpen && o.hasSelection) o.clearSelection();
          break;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcuts.enabled]);
}
