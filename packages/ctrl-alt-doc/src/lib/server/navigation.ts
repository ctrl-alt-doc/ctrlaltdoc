import { readFile, readdir } from 'node:fs/promises';

import { join, relative, extname, basename } from 'node:path';

import yaml from 'yaml';

import { getDocument } from './documents.js';

import type { CategoryConfig, NavigationItem } from './types.js';

const DOCS_PATH = 'docs';

type RuntimeConfig = {
	callouts?: Record<string, { label?: string; icon?: string }>;
	icons?: Record<string, string>;
};

function titleFromFilename(filename: string): string {
	return filename
		.replace(/\.md$/, '')
		.replace(/[-_]/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function getCategoryConfig(directory: string): Promise<CategoryConfig> {
	const configPath = join(directory, '_category.yml');

	try {
		const source = await readFile(configPath, 'utf-8');

		return yaml.parse(source) ?? {};
	} catch {
		return {};
	}
}

async function buildNavigation(
	directory: string,
	config: RuntimeConfig
): Promise<NavigationItem[]> {
	const entries = await readdir(directory, {
		withFileTypes: true
	});

	const items: NavigationItem[] = [];

	for (const entry of entries) {
		const fullPath = join(directory, entry.name);

		/*
		 * Directories become navigation categories.
		 */
		if (entry.isDirectory()) {
			const children = await buildNavigation(fullPath, config);

			const categoryConfig = await getCategoryConfig(fullPath);

			const categorySlug = relative(DOCS_PATH, fullPath);

			let categoryDocument = null;

			try {
				categoryDocument = await getDocument(categorySlug, config);
			} catch {
				// Category has no index.md.
			}

			if (categoryConfig.hidden) {
				continue;
			}

			items.push({
				title:
					categoryConfig.label ??
					categoryDocument?.title ??
					titleFromFilename(entry.name),

				slug: categorySlug,

				type: 'category',

				position: categoryConfig.position,

				collapsed: categoryConfig.collapsed ?? true,

				description: categoryDocument?.description,

				hidden: categoryDocument?.frontmatter.sidebar?.hidden,

				children
			});

			continue;
		}

		/*
		 * Ignore anything that isn't Markdown.
		 */
		if (!entry.isFile() || extname(entry.name) !== '.md') {
			continue;
		}

		/*
		 * index.md represents the category/root itself.
		 *
		 * It is represented by its parent category
		 * rather than as a separate navigation item.
		 */
		if (basename(entry.name) === 'index.md') {
			continue;
		}

		const slug = relative(DOCS_PATH, fullPath).replace(/\.md$/, '');

		const document = await getDocument(slug, config);

		if (document.frontmatter.draft) {
			continue;
		}

		/*
		 * Hidden pages are still routable,
		 * but don't appear in navigation.
		 */
		if (document.frontmatter.sidebar?.hidden) {
			continue;
		}

		items.push({
			title: document.frontmatter.sidebar?.label ?? document.title,

			slug,

			type: 'page',

			position: document.frontmatter.sidebar?.position,

			badge: document.frontmatter.sidebar?.badge
		});
	}

	return items.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
}

export async function getNavigation(config: RuntimeConfig): Promise<NavigationItem[]> {
	return buildNavigation(DOCS_PATH, config);
}

/**
 * Flatten the navigation tree into the order in
 * which documents should be visited.
 *
 * Category items are included only when they have
 * an index.md document.
 */
export function flattenNavigation(items: NavigationItem[]): NavigationItem[] {
	const result: NavigationItem[] = [];

	for (const item of items) {
		if (item.hidden) {
			continue;
		}

		/*
		 * A category with a description has an
		 * index.md document associated with it.
		 */
		if (item.type === 'category' && item.description !== undefined) {
			result.push(item);
		}

		/*
		 * Normal pages are always navigable.
		 */
		if (item.type === 'page') {
			result.push(item);
		}

		/*
		 * Walk into child pages/categories.
		 */
		if (item.children?.length) {
			result.push(...flattenNavigation(item.children));
		}
	}

	return result;
}