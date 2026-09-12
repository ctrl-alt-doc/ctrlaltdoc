---
title: Navigation
description: Organise documentation into pages and categories.
---

# Navigation

ctrl alt doc builds navigation from the structure of your `docs/` directory.

Directories become categories, while Markdown files become documentation pages.

## Example structure

```text
docs/
├── index.md
├── getting-started/
│   ├── _category.yml
│   ├── index.md
│   └── installation.md
└── reference/
    ├── _category.yml
    ├── index.md
    └── kitchen-sink.md
```

## Categories

A directory represents a category.

An `index.md` inside that directory becomes the category's landing page.

For example:

```text
docs/getting-started/index.md
```

becomes:

```text
/getting-started
```

## Pages

Markdown files other than `index.md` become individual pages.

For example:

```text
docs/getting-started/installation.md
```

becomes:

```text
/getting-started/installation
```

## Category configuration

A category can have an `_category.yml` file.

This can be used to configure things such as its label, position, and collapsed state.

Example:

```yaml
label: Getting Started
position: 1
collapsed: false
```

## Sidebar configuration

Individual pages can also control how they appear in the sidebar using frontmatter.

See [Frontmatter](/reference/frontmatter) for details.
