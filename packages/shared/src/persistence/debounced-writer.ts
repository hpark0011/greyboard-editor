import { atomicWrite } from "./atomic-write";

const timers = new Map<string, ReturnType<typeof setTimeout>>();
const pending = new Map<string, string>();

export function debouncedWrite(
  filePath: string,
  content: string,
  delay = 500
): void {
  pending.set(filePath, content);

  const existing = timers.get(filePath);
  if (existing) clearTimeout(existing);

  timers.set(
    filePath,
    setTimeout(async () => {
      timers.delete(filePath);
      const data = pending.get(filePath);
      if (data !== undefined) {
        pending.delete(filePath);
        try {
          await atomicWrite(filePath, data);
        } catch (error) {
          console.error(`Debounced write failed for ${filePath}:`, error);
        }
      }
    }, delay)
  );
}

export async function flushAll(): Promise<void> {
  const entries: [string, string][] = [];
  for (const [filePath, timer] of timers) {
    clearTimeout(timer);
    const data = pending.get(filePath);
    if (data !== undefined) entries.push([filePath, data]);
  }
  timers.clear();
  pending.clear();
  const results = await Promise.allSettled(
    entries.map(([p, d]) => atomicWrite(p, d))
  );
  for (const r of results) {
    if (r.status === "rejected") console.error("Flush failed:", r.reason);
  }
}
