---
title: Installation
description: Install ctrl alt doc and start your documentation site.
toc: true
sidebar:
  badge: Updated
---

## Update notifications

When you start the development server, ctrl alt doc checks at most once every 24 hours for a newer package version. If an update is available, the terminal displays the appropriate update command for your package manager.

The check is skipped during CI, never runs during production builds, and does not delay or prevent the development server from starting. To disable it, set `CTRL_ALT_DOC_DISABLE_UPDATE_CHECK=1` in your environment.

Getting a documentation site running should be straightforward.

## Install

The easiest way to start is with the project creator:

```bash
npm create ctrlaltdoc@latest my-docs
```

It asks for your documentation site title and optional GitHub repository URL, then writes those values into `ctrlaltdoc.config.ts`. Press Enter to accept the suggested values.

For an existing project, install the framework with your package manager:

```bash
pnpm add ctrl-alt-doc
```

or:

```bash
npm install ctrl-alt-doc
```

## Create your configuration

A minimal configuration looks like this:

```ts
import { defineConfig } from 'ctrl-alt-doc';

export default defineConfig({
	title: 'My Documentation',
	description: 'Documentation for my project.'
});
```

## Write your first page

Create:

```text
docs/
└── index.md
```

Then start the development server.

:::tip[Keep it simple]
Start with ordinary Markdown. Add the richer ctrl alt doc components when you actually need them.
:::
