import { json } from '@sveltejs/kit';

import { searchDocuments } from 'ctrl-alt-doc/server';

import { getSiteConfig } from '$lib/server/site';

export async function GET({ url }) {
	const query = url.searchParams.get('q') ?? '';
	const site = getSiteConfig();

	const results = await searchDocuments(query, site);

	return json(results);
}
