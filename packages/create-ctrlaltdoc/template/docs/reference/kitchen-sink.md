---
title: Kitchen Sink
description: A showcase of the documentation features built into ctrl alt doc.
---

This page brings together the features built into ctrl alt doc.

The individual Reference pages explain how each feature works. This page is simply a place to see everything working together.

## Markdown

Standard Markdown is supported throughout your documentation.

You can use **bold text**, _italic text_, `inline code`, [internal links](/getting-started/installation), and external links such as [ctrl alt doc](https://ctrlaltdoc.cc).

### Lists

- First item
- Second item
- Third item

1. First item
2. Second item
3. Third item

## Blockquotes

> Documentation, without the baggage.

## Tables

Standard Markdown tables are supported.

| Feature           | Status | Built in |
| ----------------- | ------ | -------- |
| Search            | Ready  | Yes      |
| Sidebar           | Ready  | Yes      |
| Table of contents | Ready  | Yes      |
| Callouts          | Ready  | Yes      |

## Code

Code blocks support syntax highlighting and copying.

```ts
const message = 'Documentation, without the baggage.';

console.log(message);
```

Here's another example:

```bash
pnpm install
pnpm dev
```

## Callouts

Callouts highlight important information.

### Note

:::note
This is a note.
:::

### Tip

:::tip
This is a useful tip.
:::

### Warning

:::warning
This is a warning.
:::

### Danger

:::danger
This is a danger callout.
:::

### Custom title

:::warning[Before you continue]
Make sure you have saved your work.
:::

## Steps

Processes can be presented as numbered sequences.

:::steps

1. **Install**

   Add the package to your project.

2. **Configure**

   Create `ctrlaltdoc.config.ts`.

3. **Write**

   Add Markdown documents to `docs/`.
   :::

## Tabs

Related variants can be grouped into tabs.

:::tabs
== pnpm

```bash
pnpm add ctrl-alt-doc
```

== npm

```bash
npm install ctrl-alt-doc
```

:::

## Details

Details blocks let readers reveal supporting information when they need it.

:::details[More information]
This content is hidden until the details block is opened.

You can still use **Markdown**, lists, and `inline code` inside the block.
:::

## Cards

Cards provide a visual way to group related destinations.

:::cards

:::card[Getting Started](/getting-started)
Learn the basics of ctrl alt doc.
:::

:::card[Installation](/getting-started/installation)
Install ctrl alt doc and create your first project.
:::

:::card[Reference](/reference)
Explore the complete feature reference.
:::

:::

## Documentation cards

Documentation cards automatically build a visual index from the documentation structure.

The [Reference](/reference) category demonstrates this feature with its collection of reference pages.

## Downloads

Download blocks provide a visual way to present downloadable resources.

:::downloads

:::download[Example resource](https://example.com/example.zip)
:::

:::download[Another resource](https://example.com/another.zip)
:::

:::

## Figures

Figures combine images with optional captions.

:::figure[An example figure]
![A documentation site displayed in a browser](https://placehold.co/1200x675/png)
:::

## File trees

File trees make project structures easier to understand.

:::file-tree

- docs/
  - index.md
  - getting-started/
    - index.md
    - installation.md
  - reference/
    - index.md
    - kitchen-sink.md
    - cards.md
    - callouts.md

:::

## Navigation

The documentation structure automatically becomes the site's navigation.

This example project is organised into Getting Started and Reference categories.

The sidebar, active states, category expansion, breadcrumbs, and pagination are all part of the documentation experience.

## Table of contents

The table of contents on the right is generated automatically from this page's headings.

It follows the document structure and provides quick access to the sections above.

## Frontmatter

This page, like every ctrl alt doc document, can define metadata in its frontmatter.

For example, this document defines its title and description at the top of the file.

## Keep exploring

The kitchen sink shows the features working together.

For the details of each feature, explore the individual pages in the Reference section.
