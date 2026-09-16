---
title: Callouts
description: Highlight important information with configurable callout blocks.
---

Callouts highlight information that deserves attention without interrupting the main flow of the document.

ctrl alt doc provides four built-in callout types:

- `note`
- `tip`
- `warning`
- `danger`

## Note

Use `:::note` for general information.

:::note
This is a note.
:::

## Tip

Use `:::tip` for useful advice or recommendations.

:::tip
Keep your documentation focused and easy to scan.
:::

## Warning

Use `:::warning` when something deserves caution.

:::warning
Make sure you have saved your changes before continuing.
:::

## Danger

Use `:::danger` for potentially destructive or serious situations.

:::danger
Deleting a project cannot be undone.
:::

## Custom titles

You can provide a custom title by adding it in square brackets.

The syntax is `:::type[Title]`.

:::warning[Before you continue]
Make sure you have saved your work.
:::

## Content

Callouts can contain normal Markdown content.

:::tip[Remember]
You can use **Markdown** inside a callout.

- Lists work
- Links work
- `inline code` works
  :::

## Configuration

Callout types and their labels and icons are configured in `ctrlaltdoc.config.ts`.

This means a project can customise the callout presentation without changing the documentation syntax.
