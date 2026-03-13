export interface MarkdownDocument {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
  lastSavedAt: number | null;
}
