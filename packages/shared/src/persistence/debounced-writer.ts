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
        await atomicWrite(filePath, data);
      }
    }, delay)
  );
}

export async function flushAll(): Promise<void> {
  for (const [path, timer] of timers) {
    clearTimeout(timer);
    timers.delete(path);
    const data = pending.get(path);
    if (data !== undefined) {
      pending.delete(path);
      await atomicWrite(path, data);
    }
  }
}
