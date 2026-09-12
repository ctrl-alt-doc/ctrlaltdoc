import type { Component } from 'svelte';

const documents = import.meta.glob('/docs/**/*.md', { eager: true }) as Record<
	string,
	{ default: Component }
>;

export function getDocumentComponent(slug: string): Component | undefined {
	const candidates = [`/docs/${slug || 'index'}.md`, `/docs/${slug}/index.md`];

	for (const path of candidates) {
		if (documents[path]) {
			return documents[path].default;
		}
	}

	return undefined;
}
