export type PageToken = number | "ellipsis";

export function pageRange(current: number, total: number, siblings = 1): PageToken[] {
  if (total <= 0) return [1];

  const first = 1;
  const last = total;
  const start = Math.max(first, current - siblings);
  const end = Math.min(last, current + siblings);

  const tokens: PageToken[] = [];

  tokens.push(first);
  if (start > first + 1) tokens.push("ellipsis");

  for (let page = Math.max(start, first + 1); page <= Math.min(end, last - 1); page++) {
    tokens.push(page);
  }

  if (end < last - 1) tokens.push("ellipsis");
  if (last !== first) tokens.push(last);

  return tokens;
}
