---
title: Frontmatter
description: Configure document metadata and navigation behaviour.
---

# Frontmatter

Frontmatter is YAML placed at the beginning of a Markdown document.

It defines metadata that ctrl alt doc uses when rendering and organising the document.

## Basic frontmatter

A document can define a title and description:

```yaml
---
title: Installation
description: Install ctrl alt doc and create your first documentation project.
---
```

## Sidebar configuration

Sidebar behaviour can be controlled through the `sidebar` object.

```yaml
---
title: Installation
sidebar:
  label: Install
  position: 1
---
```

### Label

`sidebar.label` changes the text displayed in the sidebar.

```yaml
sidebar:
  label: Install
```

### Position

`sidebar.position` controls the order of the page within its category.

```yaml
sidebar:
  position: 1
```

### Hidden pages

A page can remain accessible by URL while being hidden from the sidebar.

```yaml
sidebar:
  hidden: true
```

### Badges

Pages can display a badge in the sidebar.

```yaml
sidebar:
  badge: New
```

## Drafts

A document can be marked as a draft:

```yaml
---
draft: true
---
```

Draft documents are excluded from generated navigation.

## Table of contents

Disable the table of contents for a document with:

```yaml
---
toc: false
---
```

## Complete example

```yaml
---
title: Installation
description: Install ctrl alt doc and create your first documentation project.
sidebar:
  label: Install
  position: 1
  badge: New
toc: true
draft: false
---
```
