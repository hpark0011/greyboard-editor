import fs from "fs";

export function watchDirectory(
  dirPath: string,
  onChange: () => void,
  debounceMs = 100
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const watcher = fs.watch(dirPath, { recursive: true }, () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(onChange, debounceMs);
  });

  return () => {
    watcher.close();
    if (timer) clearTimeout(timer);
  };
}
