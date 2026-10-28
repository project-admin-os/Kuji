// Lets code outside a view (e.g. sign-out) commit pending deletes first.

type Flusher = () => Promise<void>;

const flushers = new Set<Flusher>();

export function registerFlusher(flusher: Flusher): () => void {
  flushers.add(flusher);
  return () => {
    flushers.delete(flusher);
  };
}

export async function flushAllPending(): Promise<void> {
  await Promise.allSettled([...flushers].map((flush) => flush()));
}
