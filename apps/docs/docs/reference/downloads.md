---
title: Downloads
description: Add downloadable resources to your documentation.
---

Downloads provide a visual way to present files and other downloadable resources.

A downloads group starts with `:::downloads`. Each entry uses `:::download[Title](URL)`.

## Basic downloads

:::downloads

:::download[Example resource](https://example.com/example.zip)
:::

:::

## Multiple downloads

You can place multiple downloads in the same group.

:::downloads

:::download[Example resource](https://example.com/example.zip)
:::

:::download[Another resource](https://example.com/another.zip)
:::

:::

## Local files

A download can point to a file served by your documentation site.

```text
:::
:::
```

The file must exist at the referenced path.

## External resources

Downloads can also point to external URLs.

```text
:::
:::
```
