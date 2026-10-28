import { useCallback, useEffect, useRef, useState } from "react";
import {
  EMPTY_SELECTION,
  pruneSelection,
  selectAll as selectAllIds,
  selectionState,
  selectRange,
  toggleId,
  type Selection,
} from "../../lib/selection";

interface Mode {
  active: boolean;
  exitWhenEmpty: boolean;
}

const MODE_OFF: Mode = { active: false, exitWhenEmpty: false };

export interface EnterOptions {
  // Long-press entry (Stage 5) sets this: the mode ends when the last item is deselected.
  exitWhenEmpty?: boolean;
}

export function useSelection(ids: number[], escEnabled: boolean) {
  const [selected, setSelected] = useState<Selection>(EMPTY_SELECTION);
  const [mode, setMode] = useState<Mode>(MODE_OFF);

  const selectedRef = useRef<Selection>(EMPTY_SELECTION);
  const idsRef = useRef(ids);
  const anchorRef = useRef<number | null>(null);
  const hadSelectionRef = useRef(false);

  useEffect(() => {
    idsRef.current = ids;
  });

  const commit = useCallback((next: Selection) => {
    selectedRef.current = next;
    setSelected(next);
  }, []);

  // Refetch or delete: keep only ids that still exist.
  useEffect(() => {
    const next = pruneSelection(selectedRef.current, ids);
    if (next !== selectedRef.current) commit(next);
  }, [ids, commit]);

  // Reusable entry point (Select button now, long-press in Stage 5).
  const enter = useCallback((options: EnterOptions = {}) => {
    hadSelectionRef.current = false;
    setMode({ active: true, exitWhenEmpty: options.exitWhenEmpty ?? false });
  }, []);

  const clear = useCallback(() => {
    anchorRef.current = null;
    commit(EMPTY_SELECTION);
  }, [commit]);

  const exit = useCallback(() => {
    clear();
    setMode(MODE_OFF);
  }, [clear]);

  const toggle = useCallback(
    (id: number, range = false) => {
      const anchor = anchorRef.current;
      if (range && anchor !== null) {
        commit(selectRange(selectedRef.current, idsRef.current, anchor, id));
      } else {
        commit(toggleId(selectedRef.current, id));
        anchorRef.current = id;
      }
    },
    [commit],
  );

  const selectAll = useCallback(() => commit(selectAllIds(idsRef.current)), [commit]);

  // exitWhenEmpty rule: leave the mode once the last item is deselected.
  useEffect(() => {
    if (selected.size > 0) hadSelectionRef.current = true;
    else if (hadSelectionRef.current && mode.active && mode.exitWhenEmpty) {
      hadSelectionRef.current = false;
      setMode(MODE_OFF);
    }
  }, [selected, mode]);

  // Esc exits the mode (the desktop shortcut hook handles Esc for the bulk bar).
  useEffect(() => {
    if (!mode.active || !escEnabled) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") exit();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mode.active, escEnabled, exit]);

  return {
    selected,
    count: selected.size,
    state: selectionState(selected, ids),
    active: mode.active,
    enter,
    exit,
    clear,
    toggle,
    selectAll,
  };
}
