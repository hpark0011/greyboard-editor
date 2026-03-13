import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { AppConfig } from "@greyboard/core/config";
import { defaultConfig } from "@greyboard/core/config";

export async function loadConfig(configPath: string): Promise<AppConfig> {
  try {
    const content = await fs.readFile(configPath, "utf-8");
    const parsed = JSON.parse(content) as Partial<AppConfig>;
    return {
      ...defaultConfig,
      ...parsed,
      panelSizes: { ...defaultConfig.panelSizes, ...parsed.panelSizes },
    };
  } catch {
    return { ...defaultConfig };
  }
}

export async function saveConfig(
  configPath: string,
  config: AppConfig
): Promise<void> {
  const tmpPath = path.join(
    path.dirname(configPath),
    `.${path.basename(configPath)}.${randomUUID()}.tmp`
  );
  await fs.writeFile(tmpPath, JSON.stringify(config, null, 2), "utf-8");
  await fs.rename(tmpPath, configPath);
}
