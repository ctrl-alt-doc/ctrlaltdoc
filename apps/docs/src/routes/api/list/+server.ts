import { error, json } from '@sveltejs/kit';

import { getNavigation } from 'ctrl-alt-doc/server';
import type { NavigationItem } from 'ctrl-alt-doc/server';

import { getSiteConfig } from '$lib/server/site';

function findCategory(items: NavigationItem[], slug: string): NavigationItem | undefined {
	for (const item of items) {
		if (item.type === 'category' && item.slug === slug) {
			return item;
		}

		const match = item.children && findCategory(item.children, slug);

		if (match) {
			return match;
		}
	}
}

export async function GET({ url }) {
	const categorySlug = url.searchParams.get('category')?.trim() ?? '';

	if (!categorySlug) {
		error(400, 'A category slug is required');
	}

	const navigation = await getNavigation(getSiteConfig());
	const category = findCategory(navigation, categorySlug);

	if (!category) {
		error(404, 'Category not found');
	}

	const pages = (category.children ?? [])
		.filter((item) => item.type === 'page')
		.map((page) => ({
			title: page.title,
			slug: page.slug
		}));

	return json({
		category: {
			title: category.title,
			slug: category.slug
		},
		pages
	});
}
