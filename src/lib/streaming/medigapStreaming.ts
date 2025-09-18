"use client";

/** Async generator to stream carrier summaries with a delay between each. */
export async function* streamCarriers<T>(items: T[], delayMs = 400) {
  for (let i = 0; i < items.length; i++) {
    yield items[i];
    if (i < items.length - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

export interface StreamOptions {
  delayMs?: number;
  onFirst?: (itemCount: number) => void;
  onComplete?: (total: number) => void;
}

/** Convenience function that consumes the generator and invokes callbacks. */
export async function runCarrierStream<T>(items: T[], opts: StreamOptions, push: (chunk: T) => void) {
  let index = 0;
  for await (const item of streamCarriers(items, opts.delayMs)) {
    push(item);
    index++;
    if (index === 1 && opts.onFirst) opts.onFirst(index);
  }
  if (opts.onComplete) opts.onComplete(index);
  return index;
}
