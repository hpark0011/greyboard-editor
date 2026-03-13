import fs from "fs/promises";

export async function readJsonl<T>(filePath: string): Promise<T[]> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());
    const results: T[] = [];
    for (const line of lines) {
      try {
        results.push(JSON.parse(line));
      } catch {
        // Skip corrupt lines
      }
    }
    return results;
  } catch {
    return [];
  }
}

export async function appendJsonl<T>(
  filePath: string,
  entry: T
): Promise<void> {
  const line = JSON.stringify(entry) + "\n";
  await fs.appendFile(filePath, line, "utf-8");
}
