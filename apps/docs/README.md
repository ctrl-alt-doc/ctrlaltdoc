# ctrl alt doc

**Documentation, without the baggage.**

ctrl alt doc is a documentation framework for building documentation sites with Markdown, Svelte, and a set of features designed to work out of the box.

Write your documentation. Organise it into pages and categories. Configure what you need. Ship.

## Why ctrl alt doc?

Documentation frameworks shouldn't make you fight the framework.

ctrl alt doc is built around a simple idea: the things you need for a documentation site should already work.

No swizzling.

No ejecting framework components just to change how they behave.

No assembling a collection of plugins before you can start writing.

Just documentation.

## What you get

ctrl alt doc includes the core pieces of a modern documentation site:

- Markdown documentation
- Nested navigation and categories
- Search
- Breadcrumbs
- Pagination
- Automatic table of contents
- Syntax-highlighted code blocks
- Copyable code
- Callouts
- Details blocks
- Cards
- Automatically generated documentation cards
- Downloads
- Figures
- File trees
- Configurable navigation and theme behaviour
- Custom icons
- User-authored Svelte components in Markdown

The goal is for these features to feel like part of the framework rather than separate things you have to bolt on.

## Getting started

The project currently includes a complete example documentation set so you can see ctrl alt doc in action.

Start the development server:

```bash
pnpm dev
```

Then open the local development URL shown in the terminal.

The example documentation is intentionally comprehensive. It demonstrates the built-in features and provides a starting point for exploring how ctrl alt doc works.

## Documentation structure

ctrl alt doc uses your `docs/` directory as the source for your documentation.

The Vite plugin embeds that content in production builds. Runtime servers read from the embedded
manifest, while development and direct Node usage can continue reading from the filesystem.

A typical project looks like this:

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

Markdown files become documentation pages.

Directories become navigation categories.

An `index.md` file becomes the landing page for the root or its category.

## Writing documentation

A document is simply a Markdown file with optional frontmatter:

```yaml
---
title: Installation
description: Install ctrl alt doc and create your first documentation project.
---
```

Standard Markdown works as you'd expect, while ctrl alt doc adds documentation-focused features such as callouts, cards, details, downloads, figures, and file trees.

The included Reference section documents each of these features individually.

## Project status

ctrl alt doc 1.0.0 is the first public release of the documentation framework.

The bundled documentation demonstrates the supported feature set. The package API, generated-project workflow, server-side rendering, and production build have been validated together.

## Philosophy

ctrl alt doc should get out of the way.

You shouldn't need to understand the framework's internals before you can make your documentation look and behave the way you want.

**Write. Configure. Ship.**

## Development

This repository contains the ctrl alt doc framework and its example documentation.

Install dependencies:

```bash
pnpm install
```

Start development:

```bash
pnpm dev
```

Run the checks:

```bash
pnpm check
pnpm lint
pnpm build
```

## License

ctrl alt doc is released under the [MIT License](../../LICENSE).
