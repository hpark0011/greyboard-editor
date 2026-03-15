import { useCallback, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { EditorToolbar } from "./editor-toolbar";
import { EditorStatusBar } from "./editor-status-bar";

interface MarkdownStorage {
  getMarkdown: () => string;
}

function getMarkdownContent(storage: Record<string, any>): string {
  return (storage as { markdown: MarkdownStorage }).markdown.getMarkdown();
}

interface MarkdownEditorProps {
  content: string;
  filePath: string;
  isDirty: boolean;
  onUpdate: (content: string) => void;
  onSave: () => void;
}

export function MarkdownEditor({
  content,
  filePath,
  isDirty,
  onUpdate,
  onSave,
}: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      Markdown,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(getMarkdownContent(editor.storage));
    },
  });

  useEffect(() => {
    if (editor && content !== getMarkdownContent(editor.storage)) {
      editor.commands.setContent(content);
    }
  }, [filePath]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    },
    [onSave],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!editor) return null;

  const wordCount = editor.getText().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-auto p-6 mx-auto w-full items-center">
        <EditorContent
          editor={editor}
          className={[
            // Typography (prose)
            "prose prose-neutral dark:prose-invert",
            // Sizing
            "max-w-2xl mx-auto",
            // Interactive states
            "focus:outline-none",
            // Child overrides
            "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-full",
          ].join(" ")}
        />
      </div>
      <EditorStatusBar
        filePath={filePath}
        isDirty={isDirty}
        wordCount={wordCount}
      />
    </div>
  );
}
