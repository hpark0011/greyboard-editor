import fs from "fs/promises";
import type { AppConfig } from "@greyboard/core/config";
import { defaultConfig } from "@greyboard/core/config";

export async function loadConfig(configPath: string): Promise<AppConfig> {
  try {
    const content = await fs.readFile(configPath, "utf-8");
    return { ...defaultConfig, ...JSON.parse(content) };
  } catch {
    return { ...defaultConfig };
  }
}

export async function saveConfig(
  configPath: string,
  config: AppConfig
): Promise<void> {
  const tmpPath = configPath + ".tmp";
  await fs.writeFile(tmpPath, JSON.stringify(config, null, 2), "utf-8");
  await fs.rename(tmpPath, configPath);
}
