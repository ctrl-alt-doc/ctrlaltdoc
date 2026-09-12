import { error } from '@sveltejs/kit';

import {
	createBreadcrumbs,
	createPagination,
	createTableOfContents,
	flattenNavigation,
	getDocument
} from 'ctrl-alt-doc/server';

import { getSiteConfig } from '$lib/server/site';

export async function load({ params, parent }) {
	try {
		const site = getSiteConfig();

		const document = await getDocument(params.slug, site);
		const { navigation } = await parent();

		const flatNavigation = flattenNavigation(navigation);

		return {
			document,
			toc: createTableOfContents(document.source),
			breadcrumbs: createBreadcrumbs(navigation, params.slug),
			pagination: createPagination(flatNavigation, params.slug)
		};
	} catch {
		error(404, 'Document not found');
	}
}