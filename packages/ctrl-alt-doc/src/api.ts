// Handlers for the documentation API used by integrations such as ctrlaltbot.
// Sites expose them from one-line route files, so API changes ship with package
// updates instead of requiring edits to each site:
//
//   // src/routes/api/search/+server.ts
//   import { searchEndpoint } from 'ctrl-alt-doc/api';
//   import { getSiteConfig } from '$lib/server/site';
//
//   export const GET = searchEndpoint(getSiteConfig);

import { createBreadcrumbs } from './lib/server/breadcrumbs.js';
import { getDocument } from './lib/server/documents.js';
import { getNavigation } from './lib/server/navigation.js';
import { searchDocuments, suggestDocuments } from './lib/server/search.js';

import type { ContentManifest } from './lib/server/content-source.js';
import type { NavigationItem } from './lib/server/types.js';

export type ApiConfig = {
	callouts?: Record<string, { label?: string; icon?: string }>;
	icons?: Record<string, string>;
	content?: ContentManifest;
};

export type ApiHandler = (event: { url: URL }) => Promise<Response>;

const MAX_SUGGESTIONS = 25;

function errorResponse(status: number, message: string): Response {
	return Response.json({ message }, { status });
}

/** The page's section and ancestor titles, for integrations that show where a page lives. */
function location(navigation: NavigationItem[], slug: string): { section?: string; breadcrumb: string[] } {
	// createBreadcrumbs() ends with the page itself, which is not part of its location.
	const ancestors = createBreadcrumbs(navigation, slug).slice(0, -1);
	const section = ancestors[0]?.title;

	return { ...(section ? { section } : {}), breadcrumb: ancestors.map((item) => item.title) };
}

function findCategories(items: NavigationItem[]): NavigationItem[] {
	return items.flatMap((item) => [
		...(item.type === 'category' ? [item] : []),
		...(item.children ? findCategories(item.children) : [])
	]);
}

/** `GET /api/search?q=<query>`: ranked search results with each page's location. */
export function searchEndpoint(getConfig: () => ApiConfig): ApiHandler {
	return async ({ url }) => {
		const config = getConfig();
		const [results, navigation] = await Promise.all([
			searchDocuments(url.searchParams.get('q') ?? '', config),
			getNavigation(config)
		]);

		return Response.json(results.map((result) => ({ ...result, ...location(navigation, result.slug) })));
	};
}

/** `GET /api/suggest?q=<text>&kind=page|category`: titles for autocomplete. */
export function suggestEndpoint(getConfig: () => ApiConfig): ApiHandler {
	return async ({ url }) => {
		const query = url.searchParams.get('q') ?? '';

		if (url.searchParams.get('kind') === 'category') {
			const normalizedQuery = query.trim().toLowerCase();
			const categories = findCategories(await getNavigation(getConfig()));

			return Response.json(
				categories
					.filter((category) => category.title.toLowerCase().includes(normalizedQuery))
					.slice(0, MAX_SUGGESTIONS)
					.map((category) => ({ title: category.title, slug: category.slug }))
			);
		}

		return Response.json(await suggestDocuments(query, getConfig(), MAX_SUGGESTIONS));
	};
}

/** `GET /api/page?slug=<slug>`: one page's metadata, location, table of contents, HTML, and Markdown source. */
export function pageEndpoint(getConfig: () => ApiConfig): ApiHandler {
	return async ({ url }) => {
		const slug = url.searchParams.get('slug')?.trim() ?? '';

		if (!slug) {
			return errorResponse(400, 'A page slug is required');
		}

		const config = getConfig();
		let document;

		try {
			document = await getDocument(slug, config);
		} catch {
			return errorResponse(404, 'Document not found');
		}

		return Response.json({
			title: document.title,
			description: document.description,
			excerpt: document.excerpt,
			slug: document.slug,
			...location(await getNavigation(config), document.slug),
			toc: document.toc,
			content: document.content,
			markdown: document.source
		});
	};
}

/** `GET /api/list?category=<slug>`: the pages directly inside a category. */
export function listEndpoint(getConfig: () => ApiConfig): ApiHandler {
	return async ({ url }) => {
		const categorySlug = url.searchParams.get('category')?.trim() ?? '';

		if (!categorySlug) {
			return errorResponse(400, 'A category slug is required');
		}

		const category = findCategories(await getNavigation(getConfig())).find((item) => item.slug === categorySlug);

		if (!category) {
			return errorResponse(404, 'Category not found');
		}

		return Response.json({
			category: { title: category.title, slug: category.slug },
			pages: (category.children ?? [])
				.filter((item) => item.type === 'page')
				.map((page) => ({ title: page.title, slug: page.slug }))
		});
	};
}
