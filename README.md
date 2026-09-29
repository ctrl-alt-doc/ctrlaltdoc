# ctrl alt doc

[![npm](https://img.shields.io/npm/v/ctrl-alt-doc?style=flat-square&color=ce0985&labelColor=212121&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNiAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIj48ZyBzdHJva2Utd2lkdGg9IjIuNCI+PHBhdGggZD0iTTUuNiAzLjRINGEyIDIgMCAwIDAtMiAydjEzLjJhMiAyIDAgMCAwIDIgMmgxLjYiLz48cGF0aCBkPSJNMjAuNCAzLjRIMjJhMiAyIDAgMCAxIDIgMnYxMy4yYTIgMiAwIDAgMS0yIDJoLTEuNiIvPjxjaXJjbGUgY3g9IjExLjIiIGN5PSIxNCIgcj0iMy4zIi8+PHBhdGggZD0iTTE0LjUgMTAuN3Y2LjYiLz48L2c+PHBhdGggZD0iTTE4LjQgOS42aDEuNHY4LjhoLTEuNHoiIGZpbGw9IiNmZmYiIHN0cm9rZT0ibm9uZSIvPjwvc3ZnPg==)](https://www.npmjs.com/package/ctrl-alt-doc)
[![downloads](https://img.shields.io/npm/dm/ctrl-alt-doc?style=flat-square&color=be0078&labelColor=212121&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNiAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIj48ZyBzdHJva2Utd2lkdGg9IjIuNCI+PHBhdGggZD0iTTUuNiAzLjRINGEyIDIgMCAwIDAtMiAydjEzLjJhMiAyIDAgMCAwIDIgMmgxLjYiLz48cGF0aCBkPSJNMjAuNCAzLjRIMjJhMiAyIDAgMCAxIDIgMnYxMy4yYTIgMiAwIDAgMS0yIDJoLTEuNiIvPjxjaXJjbGUgY3g9IjExLjIiIGN5PSIxNCIgcj0iMy4zIi8+PHBhdGggZD0iTTE0LjUgMTAuN3Y2LjYiLz48L2c+PHBhdGggZD0iTTE4LjQgOS42aDEuNHY4LjhoLTEuNHoiIGZpbGw9IiNmZmYiIHN0cm9rZT0ibm9uZSIvPjwvc3ZnPg==)](https://www.npmjs.com/package/ctrl-alt-doc)
[![docs](https://img.shields.io/badge/docs-ctrl_alt_doc-ce0985?style=flat-square&labelColor=212121&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNiAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIj48ZyBzdHJva2Utd2lkdGg9IjIuNCI+PHBhdGggZD0iTTUuNiAzLjRINGEyIDIgMCAwIDAtMiAydjEzLjJhMiAyIDAgMCAwIDIgMmgxLjYiLz48cGF0aCBkPSJNMjAuNCAzLjRIMjJhMiAyIDAgMCAxIDIgMnYxMy4yYTIgMiAwIDAgMS0yIDJoLTEuNiIvPjxjaXJjbGUgY3g9IjExLjIiIGN5PSIxNCIgcj0iMy4zIi8+PHBhdGggZD0iTTE0LjUgMTAuN3Y2LjYiLz48L2c+PHBhdGggZD0iTTE4LjQgOS42aDEuNHY4LjhoLTEuNHoiIGZpbGw9IiNmZmYiIHN0cm9rZT0ibm9uZSIvPjwvc3ZnPg==)](https://docs.ctrlaltdoc.cc)
[![license](https://img.shields.io/npm/l/ctrl-alt-doc?style=flat-square&color=7f7f7f&labelColor=212121)](LICENSE)
[![Discord](https://img.shields.io/discord/1541521626137370698?style=flat-square&color=ce0985&labelColor=212121&logo=discord&logoColor=white)](https://discord.gg/f6XemeeUpD)


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

The project creator asks for your documentation site title and an optional GitHub URL. The URL is used for the generated site's GitHub navbar link and is written into `ctrlaltdoc.config.ts`.

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

Mermaid diagrams and an “Edit this page on GitHub” link are planned features. They are not available in the current release.

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

## Configure your site

Edit `ctrlaltdoc.config.ts` to customise the title, description, sidebar theme, social links, footer, callouts, and icons.

```ts
import { defineConfig } from 'ctrl-alt-doc';

export default defineConfig({
	title: 'My Documentation',
	description: 'Documentation for my project.',
	theme: {
		sidebar: true
	},
	navbar: {
		socials: {
			github: 'https://github.com/owner/project'
		}
	}
});
```

Put Markdown pages in `docs/`. A root `docs/index.md` page is required. Directories become navigation categories, `index.md` files become category landing pages, and `_category.yml` files can control category labels, order, collapsed state, visibility, and badges. Page-specific metadata belongs in YAML frontmatter.

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

## Integration API

Sites expose a small JSON API under `/api` for integrations such as [ctrlaltbot](https://github.com/ctrl-alt-doc/ctrlaltbot), the Discord bot:

| Endpoint | Returns |
| --- | --- |
| `GET /api/search?q=<query>` | Ranked results with each page's `section` and `breadcrumb`, and the best-matching heading when one fits better than the title. |
| `GET /api/suggest?q=<text>&kind=page` | Page titles for autocomplete. `kind=category` returns categories. |
| `GET /api/page?slug=<slug>` | Page metadata, `section` and `breadcrumb`, table of contents, rendered HTML (`content`), and Markdown source (`markdown`). |
| `GET /api/list?category=<slug>` | The pages directly inside a category. |

The handlers ship in the `ctrl-alt-doc` package, and each route file in a site re-exports one of them, so updating the package updates the API:

```ts
// src/routes/api/search/+server.ts
import { searchEndpoint } from 'ctrl-alt-doc/api';

import { getSiteConfig } from '$lib/server/site';

export const GET = searchEndpoint(getSiteConfig);
```

Sites created before the handlers moved into the package have their own copies of these routes. Replace each `src/routes/api/<name>/+server.ts` with the equivalent re-export, using `searchEndpoint`, `suggestEndpoint`, `pageEndpoint`, or `listEndpoint`. This is only needed once.

## Documentation

Read the [ctrl alt doc documentation](https://ctrlaltdoc.cc) for the complete feature reference.

The documentation includes installation, Markdown, frontmatter, navigation, search, code blocks, callouts, cards, details, downloads, figures, file trees, steps, tabs, user-authored Svelte components, and built-in icons.

## Deploy the documentation site

The repository's documentation site is configured for Cloudflare Workers. From the repository root:

```bash
pnpm --dir apps/docs run deploy
```

The deployment uses the Cloudflare account selected by Wrangler and publishes the `ctrlaltdoc-docs` Worker. The `main` branch workflow deploys automatically when the repository has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` Actions secrets configured.

## Packages

- [`ctrl-alt-doc`](https://www.npmjs.com/package/ctrl-alt-doc) — the documentation framework
- [`create-ctrlaltdoc`](https://www.npmjs.com/package/create-ctrlaltdoc) — the project creator

### GitHub Packages

Scoped mirrors are also published to GitHub Packages for GitHub-native workflows:

- `@ctrl-alt-doc/ctrl-alt-doc`
- `@ctrl-alt-doc/create-ctrlaltdoc`

npmjs remains the recommended installation source. GitHub Packages requires GitHub authentication, including for public packages. Add the following to `.npmrc`, replacing `TOKEN` with a classic personal access token that has `read:packages` permission:

```ini
@ctrl-alt-doc:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=TOKEN
```

You can then install the framework mirror with:

```bash
npm install @ctrl-alt-doc/ctrl-alt-doc
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for issue and pull request guidance. ctrl alt doc is released under the [MIT License](LICENSE).
