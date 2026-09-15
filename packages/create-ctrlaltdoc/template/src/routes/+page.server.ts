import { error } from '@sveltejs/kit';

import { getDocument } from 'ctrl-alt-doc/server';

import { getSiteConfig } from '$lib/server/site';

export async function load() {
	try {
		const site = getSiteConfig();
		const document = await getDocument('', site);

		return {
			document,
			toc: document.toc
		};
	} catch {
		error(404, 'Homepage not found');
	}
}
