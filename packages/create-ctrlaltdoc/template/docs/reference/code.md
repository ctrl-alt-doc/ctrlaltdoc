---
title: Code
description: Add syntax-highlighted and copyable code blocks to your documentation.
---

# Code

Code blocks are a core part of technical documentation.

ctrl alt doc supports fenced Markdown code blocks with syntax highlighting.

## Basic code blocks

Specify a language after the opening fence.

```ts
const message = 'Hello, world!';

console.log(message);
```

The language identifier tells ctrl alt doc how the code should be highlighted.

## Common languages

For example:

```javascript
const greeting = 'Hello, world!';
```

```css
body {
	margin: 0;
}
```

```bash
pnpm install
pnpm dev
```

```json
{
	"name": "my-project",
	"private": true
}
```

## Copying code

Rendered code blocks include a copy button so readers can copy the contents directly.

The button copies the code without the surrounding formatting.

## Inline code

Use single backticks for short pieces of code inside a paragraph.

```markdown
Run `pnpm dev` to start the development server.
```

Run `pnpm dev` to start the development server.

## What's next?

For larger examples, use a standard fenced code block and specify the appropriate language.
