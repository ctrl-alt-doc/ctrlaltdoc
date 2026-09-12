import { error } from '@sveltejs/kit';

import { createTableOfContents, getDocument } from 'ctrl-alt-doc/server';

import { getSiteConfig } from '$lib/server/site';

export async function load() {
	try {
		const site = getSiteConfig();
		const document = await getDocument('', site);

		return {
			document,
			toc: createTableOfContents(document.source)
		};
	} catch {
		error(404, 'Homepage not found');
	}
}