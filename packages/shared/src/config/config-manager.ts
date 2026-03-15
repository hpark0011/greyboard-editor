import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { AppConfig } from "@greyboard/core/config";
import { defaultConfig } from "@greyboard/core/config";

function normalizeConfig(parsed: Partial<AppConfig>): AppConfig {
  return {
    ...defaultConfig,
    ...parsed,
    panelSizes: { ...defaultConfig.panelSizes, ...parsed.panelSizes },
  };
}

export async function loadConfig(configPath: string): Promise<AppConfig> {
  try {
    const content = await fsPromises.readFile(configPath, "utf-8");
    return normalizeConfig(JSON.parse(content) as Partial<AppConfig>);
  } catch {
    return { ...defaultConfig };
  }
}

export function loadConfigSync(configPath: string): AppConfig {
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    return normalizeConfig(JSON.parse(content) as Partial<AppConfig>);
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
  await fsPromises.writeFile(tmpPath, JSON.stringify(config, null, 2), "utf-8");
  await fsPromises.rename(tmpPath, configPath);
}

export function saveConfigSync(configPath: string, config: AppConfig): void {
  const tmpPath = path.join(
    path.dirname(configPath),
    `.${path.basename(configPath)}.${randomUUID()}.tmp`
  );
  fs.writeFileSync(tmpPath, JSON.stringify(config, null, 2), "utf-8");
  fs.renameSync(tmpPath, configPath);
}
