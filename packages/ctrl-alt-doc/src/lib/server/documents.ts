import { readFile, readdir } from 'node:fs/promises';

import { join, relative, extname } from 'node:path';

import matter from 'gray-matter';

import { renderMarkdown } from './markdown.js';

import type { DocCard, Document, DocumentFrontmatter } from './types.js';

const DOCS_PATH = 'docs';

async function resolveDocumentPath(path: string): Promise<string> {
	const normalizedPath = path === '' ? 'index' : path;

	const directPath = join(DOCS_PATH, `${normalizedPath}.md`);

	try {
		await readFile(directPath);

		return directPath;
	} catch {
		const indexPath = join(DOCS_PATH, normalizedPath, 'index.md');

		try {
			await readFile(indexPath);

			return indexPath;
		} catch {
			throw new Error(`Document not found: ${path}`);
		}
	}
}

export async function getDocCards(categorySlug: string): Promise<DocCard[]> {
	const files = await findMarkdownFiles(DOCS_PATH);

	const cards: DocCard[] = [];

	for (const file of files) {
		const relativePath = relative(DOCS_PATH, file);

		let slug = relativePath.replace(/\/index\.md$/, '');

		if (slug === 'index.md') {
			slug = '';
		} else {
			slug = slug.replace(/\.md$/, '');
		}

		if (!slug || slug === categorySlug) {
			continue;
		}

		const parent = slug.includes('/') ? slug.substring(0, slug.lastIndexOf('/')) : '';

		if (parent !== categorySlug) {
			continue;
		}

		const source = await readFile(file, 'utf-8');
		const { data } = matter(source);

		if (data.draft) {
			continue;
		}

		cards.push({
			title: data.title ?? 'Untitled',
			description: data.description ?? '',
			slug
		});
	}

	return cards;
}

export async function getDocument(
	path: string,
	config: {
		callouts?: Record<string, { label?: string; icon?: string }>;
		icons?: Record<string, string>;
	}
): Promise<Document> {
	const filePath = await resolveDocumentPath(path);

	const source = await readFile(filePath, 'utf-8');

	const { data, content } = matter(source);

	const frontmatter: DocumentFrontmatter = {
		title: data.title ?? 'Untitled',
		description: data.description ?? '',
		excerpt: data.excerpt ?? '',
		sidebar: data.sidebar,
		draft: data.draft ?? false,
		toc: data.toc ?? true
	};

	const slug = path === '' ? '' : path;

	const docCards = await getDocCards(slug);

	const rendered = await renderMarkdown(content, {
		slug,
		callouts: config.callouts,
		icons: config.icons,
		docCards
	});

	return {
		title: frontmatter.title,
		description: frontmatter.description ?? '',
		excerpt: frontmatter.excerpt ?? '',
		slug,
		path: filePath,
		source: content,
		content: rendered.content,
		toc: rendered.toc,
		frontmatter
	};
}

async function findMarkdownFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, {
		withFileTypes: true
	});

	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await findMarkdownFiles(fullPath)));

			continue;
		}

		if (entry.isFile() && extname(entry.name) === '.md') {
			files.push(fullPath);
		}
	}

	return files;
}

export async function getDocuments(
	config: {
		callouts?: Record<string, { label?: string; icon?: string }>;
		icons?: Record<string, string>;
	}
): Promise<Document[]> {
	const files = await findMarkdownFiles(DOCS_PATH);

	const documents: Document[] = [];

	for (const file of files) {
		const relativePath = relative(DOCS_PATH, file);

		let slug = relativePath.replace(/\/index\.md$/, '');

		if (slug === 'index.md') {
			slug = '';
		} else {
			slug = slug.replace(/\.md$/, '');
		}

		const document = await getDocument(slug, config);

		if (document.frontmatter.draft) {
			continue;
		}

		documents.push(document);
	}

	return documents;
}
