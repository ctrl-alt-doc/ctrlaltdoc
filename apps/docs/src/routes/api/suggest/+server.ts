import { getDocuments } from 'ctrl-alt-doc/server';
import { getNavigation } from 'ctrl-alt-doc/server';
import type { NavigationItem } from 'ctrl-alt-doc/server';
import { json } from '@sveltejs/kit';

import { getSiteConfig } from '$lib/server/site';

const MAX_SUGGESTIONS = 25;

function findCategories(items: NavigationItem[]): NavigationItem[] {
	return items.flatMap((item) => [
		...(item.type === 'category' ? [item] : []),
		...(item.children ? findCategories(item.children) : [])
	]);
}

export async function GET({ url }) {
	const query = (url.searchParams.get('q') ?? '').trim().toLowerCase();
	const kind = url.searchParams.get('kind') ?? 'page';

	if (kind === 'category') {
		const categories = findCategories(await getNavigation(getSiteConfig()));

		return json(
			categories
				.filter((category) => category.title.toLowerCase().includes(query))
				.slice(0, MAX_SUGGESTIONS)
				.map((category) => ({
					title: category.title,
					slug: category.slug
				}))
		);
	}

	const documents = await getDocuments(getSiteConfig());

	return json(
		documents
			.filter((document) => document.slug && document.title.toLowerCase().includes(query))
			.slice(0, MAX_SUGGESTIONS)
			.map((document) => ({
				title: document.title,
				slug: document.slug
			}))
	);
}
