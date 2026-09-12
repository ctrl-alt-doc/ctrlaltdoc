---
title: Table of Contents
description: Automatically generate a table of contents from document headings.
---

# Table of contents

ctrl alt doc automatically generates a table of contents from the headings in each document.

The table of contents appears alongside the document on larger screens.

## Headings

The table of contents is generated from the document's section headings.

For example:

```markdown
## Installation

### Requirements

### Install ctrl alt doc

## Configuration
```

These headings become entries in the table of contents.

## Disabling the table of contents

You can disable the table of contents for an individual document with frontmatter:

```yaml
---
toc: false
---
```

The document itself remains unchanged; only the table of contents is hidden.
