---
title: File Trees
description: Show project and directory structures visually.
---

# File trees

File trees provide a compact way to document the structure of a project or directory.

Use `:::file-tree` followed by an indented list.

## Example

:::file-tree

- docs/
  - index.md
  - getting-started/
    - index.md
    - installation.md
  - reference/
    - index.md
    - kitchen-sink.md

:::

## Folders and files

Folders are identified by entries ending in `/`.

For example:

```text
- src/
  - lib/
    - components/
    - server/
  - routes/
```

Files are represented as normal entries:

```text
- package.json
- README.md
```

## Nesting

Indent entries to create nested folders.

```text
- project/
  - src/
    - components/
      - Header.svelte
      - Sidebar.svelte
  - package.json
```
