---
title: Details
description: Hide supporting information inside expandable details blocks.
---

# Details

Details blocks let you hide supporting information until a reader chooses to reveal it.

## Basic details

Use `:::details` to create a details block.

:::details
Additional information goes here.
:::

## Custom titles

You can provide a custom title with `:::details[Title]`.

:::details[How does this work?]
The content is hidden until the reader opens the block.
:::

## Content

Details blocks can contain normal Markdown.

:::details[More information]
You can use **bold text**, links, lists, and `inline code` inside a details block.

- First item
- Second item
  :::
