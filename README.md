# ctrl alt doc

**Documentation, without the baggage.**

ctrl alt doc is an open-source documentation framework built with Markdown, Svelte, and Vite.

## Create a documentation site

You need Node.js `20.19+` or `22.12+`.

```bash
npm create ctrlaltdoc@latest my-docs
cd my-docs
npm install
npm run dev
```

The project creator asks for your documentation site title and optional GitHub repository URL, then writes those values into `ctrlaltdoc.config.ts`.

Open the local URL shown in the terminal. Your documentation lives in the `docs/` directory.

## Features

- Markdown documentation with frontmatter
- Nested navigation, breadcrumbs, pagination, search, and table of contents
- Syntax-highlighted, copyable code blocks
- Callouts, details, cards, downloads, figures, file trees, Steps, and Tabs
- Built-in Hugeicons Stroke Rounded icons
- User-authored Svelte components in Markdown
- Server-side rendering and production builds
- Build-time content bundling for serverless and edge deployments
- A complete example documentation set in every new project

Production builds embed Markdown and category metadata in the server bundle. Hosts such as
Cloudflare Workers do not need filesystem access to the source `docs/` directory at runtime.
Applications created before this behavior was introduced should update `src/lib/server/site.ts`:

```ts
import config from '../../../ctrlaltdoc.config';
import content from 'ctrl-alt-doc/content';

export function getSiteConfig() {
	return { ...config, content };
}
```

## Customise your site

Edit `ctrlaltdoc.config.ts` to customise the title, description, theme, navigation, social links, footer, callouts, and icons.

For user-authored Svelte components, install the component package in your project and import it directly into a Markdown page:

```bash
npm install @iconify-svelte/heroicons
```

```svelte
<script>
	import AcademicCapIcon from '@iconify-svelte/heroicons/academic-cap';
</script>

<AcademicCapIcon height="1em" />
```

## Documentation

Read the [ctrl alt doc documentation](https://ctrlaltdoc.cc) for the complete feature reference.

## Packages

- [`ctrl-alt-doc`](https://www.npmjs.com/package/ctrl-alt-doc) — the documentation framework
- [`create-ctrlaltdoc`](https://www.npmjs.com/package/create-ctrlaltdoc) — the project creator

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for issue and pull request guidance. ctrl alt doc is released under the [MIT License](LICENSE).
