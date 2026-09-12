---
title: Svelte Components
description: Use user-owned Svelte components directly in ctrl alt doc Markdown.
sidebar:
  badge: New
---

ctrl alt doc Markdown supports imported Svelte components. Install an icon package in your project:

```bash
pnpm add @iconify-svelte/heroicons
```

Then import and use an icon in any `.md` document:

```svelte
<script>
	import AcademicCapIcon from '@iconify-svelte/heroicons/academic-cap';
</script>

<AcademicCapIcon height="1em" aria-label="Academic cap" />
```

The component is compiled through your project's normal Svelte/Vite dependency graph. ctrl alt doc does not require icon registration.
