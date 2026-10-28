import type { ReviewItem } from "../adminApi";
import type { PerPage } from "./config";

export type { ReviewItem };

export interface ReviewsMeta {
  page: number;
  perPage: PerPage;
  total: number;
  totalPages: number;
}

export type ReviewsStatus = "loading" | "ready" | "error";
