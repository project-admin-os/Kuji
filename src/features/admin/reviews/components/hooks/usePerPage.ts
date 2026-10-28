import { useState } from "react";
import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS, PER_PAGE_STORAGE_KEY, type PerPage } from "../../config";

function isPerPage(value: unknown): value is PerPage {
  return typeof value === "number" && (PER_PAGE_OPTIONS as readonly number[]).includes(value);
}

function readInitial(): PerPage {
  try {
    const saved = Number(localStorage.getItem(PER_PAGE_STORAGE_KEY));
    if (isPerPage(saved)) return saved;
  } catch {
    // Storage blocked: fall back to the default.
  }
  return DEFAULT_PER_PAGE;
}

export function usePerPage(): [PerPage, (value: PerPage) => void] {
  const [perPage, setPerPageState] = useState<PerPage>(readInitial);

  function setPerPage(value: PerPage) {
    setPerPageState(value);
    try {
      localStorage.setItem(PER_PAGE_STORAGE_KEY, String(value));
    } catch {
      // Not fatal: the choice just won't be remembered.
    }
  }

  return [perPage, setPerPage];
}
