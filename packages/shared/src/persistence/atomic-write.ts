import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function atomicWrite(
  filePath: string,
  content: string
): Promise<void> {
  const tmpPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${randomUUID()}.tmp`
  );
  await fs.writeFile(tmpPath, content, "utf-8");
  await fs.rename(tmpPath, filePath);
}
