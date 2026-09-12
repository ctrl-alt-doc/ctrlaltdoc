import { error, json } from '@sveltejs/kit';

import { getDocument } from 'ctrl-alt-doc/server';

import { getSiteConfig } from '$lib/server/site';

export async function GET({ url }) {
	const slug = url.searchParams.get('slug')?.trim() ?? '';

	if (!slug) {
		error(400, 'A page slug is required');
	}

	try {
		const document = await getDocument(slug, getSiteConfig());

		return json({
			title: document.title,
			description: document.description,
			excerpt: document.excerpt,
			slug: document.slug
		});
	} catch {
		error(404, 'Document not found');
	}
}
