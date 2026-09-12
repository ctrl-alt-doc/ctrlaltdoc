import { getDocuments } from './documents.js';

import type { SearchResult } from './types.js';

type RuntimeConfig = {
	callouts?: Record<string, { label?: string; icon?: string }>;
	icons?: Record<string, string>;
};

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, ' ');
}

function createExcerpt(content: string, query: string): string {
	const text = stripHtml(content).replace(/\s+/g, ' ').trim();

	const index = text.toLowerCase().indexOf(query.toLowerCase());

	if (index === -1) {
		return text.slice(0, 160);
	}

	const start = Math.max(0, index - 60);

	return text.slice(start, start + 180);
}

export async function searchDocuments(
	query: string,
	config: RuntimeConfig
): Promise<SearchResult[]> {
	const documents = await getDocuments(config);

	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return [];
	}

	const titleMatches = documents.filter((document) =>
		document.title.toLowerCase().includes(normalizedQuery)
	);

	const matchingDocuments = titleMatches.length > 0
		? titleMatches
		: documents.filter((document) => {
				const haystack = [
					document.title,
					document.description,
					stripHtml(document.content)
				]
					.join(' ')
					.toLowerCase();

				return haystack.includes(normalizedQuery);
			});

	return matchingDocuments
		.map((document) => ({
			title: document.title,
			description: document.description,
			slug: document.slug,
			excerpt: createExcerpt(document.content, normalizedQuery)
		}));
}
