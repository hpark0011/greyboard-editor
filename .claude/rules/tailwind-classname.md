---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---

# Tailwind className Formatting

When a `className` has 4+ utility classes, use `cn()` with grouped multi-line strings. Leave short strings inline.

## Example

```tsx
<button
  className={cn(
    "flex items-center gap-1 text-left",
    "w-full",
    "rounded-sm",
    "px-1 py-0.5",
    "text-sm",
    "hover:bg-accent transition-colors",
    isSelected && "bg-accent text-accent-foreground"
  )}
>
```

## Group Order

One string per group, no inline comments. Omit empty groups. Conditionals go last.

| Order | Group              | Examples                                                     |
|-------|--------------------|--------------------------------------------------------------|
| 1     | Layout & alignment | `flex`, `grid`, `items-center`, `justify-between`            |
| 2     | Positioning        | `relative`, `absolute`, `fixed`, `inset-0`, `z-10`          |
| 3     | Sizing             | `h-full`, `w-full`, `max-w-none`, `min-h-screen`            |
| 4     | Shape              | `rounded-md`, `border`, `border-b`, `ring-1`, `shadow-sm`   |
| 5     | Spacing            | `p-4`, `px-3`, `gap-2`, `m-auto`                            |
| 6     | Background         | `bg-background`, `bg-primary/20`                             |
| 7     | Typography         | `text-sm`, `font-medium`, `text-foreground`, `truncate`      |
| 8     | Pseudo-element     | `after:absolute`, `before:content-['']`                      |
| 9     | Interactive states | `hover:bg-accent`, `focus:outline-none`, `transition-colors` |
| 10    | Child overrides    | `[&_.ProseMirror]:outline-none`                              |

Always `cn()` — never `.join(" ")`, arrays, or template literals. Import `cn` from the project's utils.
