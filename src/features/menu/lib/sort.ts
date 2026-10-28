export function sortByOrder<T extends { sortOrder: number }>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => left.item.sortOrder - right.item.sortOrder || left.index - right.index)
    .map(({ item }) => item);
}
