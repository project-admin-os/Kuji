import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/shared/api";
import { fetchReviews } from "../../../adminApi";
import { STALE_AFTER_MS } from "../../config";
import type { PerPage } from "../../config";
import type { ReviewItem, ReviewsMeta, ReviewsStatus } from "../../types";

interface ReviewsState {
  status: ReviewsStatus;
  items: ReviewItem[];
  meta: ReviewsMeta | null;
  isRefetching: boolean;
  lastUpdated: Date | null;
  errorStatus: number | null;
}

interface UseReviewsResult extends ReviewsState {
  refresh: () => void;
}

const INITIAL_STATE: ReviewsState = {
  status: "loading",
  items: [],
  meta: null,
  isRefetching: false,
  lastUpdated: null,
  errorStatus: null,
};

export function useReviews(
  page: number,
  perPage: PerPage,
  onPastEnd: (lastPage: number) => void,
  paused = false, // no background refetch while the user is mid-selection
): UseReviewsResult {
  const [state, setState] = useState<ReviewsState>(INITIAL_STATE);
  const tokenRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  });
  const requestRef = useRef<{ page: number; perPage: PerPage } | null>(null);

  const load = useCallback(
    (targetPage: number, targetPerPage: PerPage) => {
      const token = ++tokenRef.current;
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      requestRef.current = { page: targetPage, perPage: targetPerPage };

      setState((prev) => ({
        ...prev,
        isRefetching: true,
        status: prev.meta ? prev.status : "loading",
      }));

      fetchReviews(targetPage, targetPerPage, controller.signal)
        .then((result) => {
          if (tokenRef.current !== token) return;
          if (targetPage > 1 && result.items.length === 0 && result.total > 0) {
            onPastEnd(result.total_pages);
            return;
          }
          setState({
            status: "ready",
            items: result.items,
            meta: {
              page: result.page,
              perPage: targetPerPage,
              total: result.total,
              totalPages: result.total_pages,
            },
            isRefetching: false,
            lastUpdated: new Date(),
            errorStatus: null,
          });
        })
        .catch((error: unknown) => {
          if (tokenRef.current !== token) return;
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          const status = error instanceof ApiError ? error.status : 0;
          setState((prev) => ({
            ...prev,
            status: "error",
            isRefetching: false,
            errorStatus: status,
          }));
        });
    },
    [onPastEnd],
  );

  useEffect(() => {
    setTimeout(() => {
      load(page, perPage);
      return () => controllerRef.current?.abort();
    }, 0);
  }, [page, perPage]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible" || pausedRef.current) return;
      const last = requestRef.current;
      if (!last) return;
      const stale =
        !state.lastUpdated ||
        Date.now() - state.lastUpdated.getTime() > STALE_AFTER_MS;
      if (stale) load(last.page, last.perPage);
    }
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load, state.lastUpdated]);

  const refresh = useCallback(() => {
    const last = requestRef.current ?? { page, perPage };
    load(last.page, last.perPage);
  }, [load, page, perPage]);

  return { ...state, refresh };
}
