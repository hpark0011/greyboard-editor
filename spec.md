## Product description

AI markdown editor. It should meet the following requirements:

## Core user flow

- User selects a folder → App loads the markdown files and folders inside → User can read, edit ,delete, create markdown files

## Feature requirements

1. The interface has three panels: left, middle, right
   - Left and right sidebars are collapsible
   - All panels are resizable using react-resizable-panels.
2. User can select a folder to work on, the files and folders inside show up on the collapsible left sidebar
3. User should be able to read, edit, delete, create markdown files
4. User should be able to apply markdown style using a rich text editor interface
   - Apply bold, italic, link style
   - Apply h1, h2, h3 style
   - Add, delete image

## Technical requirements

### Tech stack

1. Core

- Monorepo: Bun monorepo
- Runtime/Package Manager: Bun
- Language: TypeScript
- Desktop Shell: Electron
- AI SDK: @anthropic-ai/claude-agent-sdk
- Bundling:
  - Bun: Main / Preload — node.js processes
  - Vite: Renderer — React UI

2. Frontend

- React with Zustand
- TailwindCSS via @tailwindcss/vite plugin
- ShadcnUI components
- Tiptap for rich text editing
- Motion for animations
- Shiki for syntax highlighting, KaTeX for math, Mermaid for diagrams
- Sentry for error tracking

3. Persistence

- Chat sessions: JSONL
- App configs: Plain JSON

4. Shared mono repo package

- package/ui: UI components
  - package/ui/primitives: ShadcnUI components
  - package/ui/components: custom components
- package/core: Types only, zero depedencies
- package/shared: Business logics
- package/features/\*: Domain feature packages

5. ENVs

- If there are services that requires api keys, mark them in the env file so I can get the api keys.

### Key architectural patterns

1. Optimistic updates

- Use Zustand as a source of optimistic UI update state

2. Creating mono repo packages

- Packages should form a strict bottom-up dependency hierarchy. There should be no circular dependencies.
- Single responsibility per package: Each package should own one domain.
- Granular subpath exports via package.json so consumers import only what they need, avoiding barrel-export bloat.

3. Persistence

- Atomic writes: Write to temp file, then rename. Prevents corruption on crash.
- Debounced persistence: Session writes coalesced via a 500ms debounce queue during streaming.
- Resilient reads: Corrupted JSONL lines are skipped rather than losing the whole session.
- Portable paths: File paths stored as ~/, ${HOME}, or {{SESSION_PATH}} tokens so data works across machines.
