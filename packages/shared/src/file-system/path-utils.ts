import path from "path";

export function isMarkdown(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === ".md" || ext === ".mdx" || ext === ".markdown";
}

export function isWithinDirectory(
  filePath: string,
  dirPath: string
): boolean {
  const resolved = path.resolve(filePath);
  const resolvedDir = path.resolve(dirPath);
  return resolved.startsWith(resolvedDir + path.sep) || resolved === resolvedDir;
}
