import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Link,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  Code,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { IconButton } from "@greyboard/ui/components/icon-button";
import { Separator } from "@greyboard/ui/primitives/separator";
import { TooltipProvider } from "@greyboard/ui/primitives/tooltip";
import { cn } from "@greyboard/ui/lib/utils";

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 border-b px-2 py-1 bg-background">
        <IconButton
          tooltip="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          size="sm"
        >
          <Undo className="h-4 w-4" />
        </IconButton>
        <IconButton
          tooltip="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          size="sm"
        >
          <Redo className="h-4 w-4" />
        </IconButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <IconButton
          tooltip="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive("bold") && "bg-accent")}
          size="sm"
        >
          <Bold className="h-4 w-4" />
        </IconButton>
        <IconButton
          tooltip="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive("italic") && "bg-accent")}
          size="sm"
        >
          <Italic className="h-4 w-4" />
        </IconButton>
        <IconButton tooltip="Link" onClick={addLink} size="sm">
          <Link className="h-4 w-4" />
        </IconButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <IconButton
          tooltip="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={cn(
            editor.isActive("heading", { level: 1 }) && "bg-accent"
          )}
          size="sm"
        >
          <Heading1 className="h-4 w-4" />
        </IconButton>
        <IconButton
          tooltip="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(
            editor.isActive("heading", { level: 2 }) && "bg-accent"
          )}
          size="sm"
        >
          <Heading2 className="h-4 w-4" />
        </IconButton>
        <IconButton
          tooltip="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={cn(
            editor.isActive("heading", { level: 3 }) && "bg-accent"
          )}
          size="sm"
        >
          <Heading3 className="h-4 w-4" />
        </IconButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <IconButton
          tooltip="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive("bulletList") && "bg-accent")}
          size="sm"
        >
          <List className="h-4 w-4" />
        </IconButton>
        <IconButton
          tooltip="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive("orderedList") && "bg-accent")}
          size="sm"
        >
          <ListOrdered className="h-4 w-4" />
        </IconButton>
        <IconButton
          tooltip="Code"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(editor.isActive("codeBlock") && "bg-accent")}
          size="sm"
        >
          <Code className="h-4 w-4" />
        </IconButton>
        <IconButton
          tooltip="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive("blockquote") && "bg-accent")}
          size="sm"
        >
          <Quote className="h-4 w-4" />
        </IconButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <IconButton tooltip="Image" onClick={addImage} size="sm">
          <ImageIcon className="h-4 w-4" />
        </IconButton>
      </div>
    </TooltipProvider>
  );
}
