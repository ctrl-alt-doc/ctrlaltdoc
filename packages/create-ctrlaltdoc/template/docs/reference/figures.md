---
title: Figures
description: Display images with captions.
---

Figures combine an image with an optional caption.

Use `:::figure[Caption]` around a standard Markdown image.

## Basic figure

:::figure[An example figure]
![A documentation site displayed in a browser](https://placehold.co/1200x675/png)
:::

## Without a caption

A caption is optional.

:::figure
![A documentation site displayed in a browser](https://placehold.co/1200x675/png)
:::

## Image accessibility

Use descriptive alt text for images.

```markdown
![A documentation site displayed in a browser](image.png)
```

The alt text is passed through to the rendered image.
