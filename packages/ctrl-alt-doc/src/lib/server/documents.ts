import { join, relative, extname } from 'node:path';

import matter from 'gray-matter';

import { renderMarkdown } from './markdown.js';
import { readContentDirectory, readContentFile } from './content-source.js';

import type { Badge, DocCard, Document, DocumentFrontmatter } from './types.js';
import type { ContentManifest } from './content-source.js';

const DOCS_PATH = 'docs';

type RuntimeConfig = {
	callouts?: Record<string, { label?: string; icon?: string }>;
	icons?: Record<string, string>;
	content?: ContentManifest;
};

function getBadge(value: unknown): Badge | undefined {
	if (value === 'New' || value === 'Updated' || value === 'Beta') {
		return value;
	}

	return undefined;
}

async function resolveDocumentPath(path: string, config: RuntimeConfig): Promise<string> {
	const normalizedPath = path === '' ? 'index' : path;

	const directPath = join(DOCS_PATH, `${normalizedPath}.md`);

	try {
		await readContentFile(directPath, config.content);

		return directPath;
	} catch {
		const indexPath = join(DOCS_PATH, normalizedPath, 'index.md');

		try {
			await readContentFile(indexPath, config.content);

			return indexPath;
		} catch {
			throw new Error(`Document not found: ${path}`);
		}
	}
}

export async function getDocCards(
	categorySlug: string,
	config: RuntimeConfig = {}
): Promise<DocCard[]> {
	const files = await findMarkdownFiles(DOCS_PATH, config);

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

		const source = await readContentFile(file, config.content);
		const { data } = matter(source);

		if (data.draft) {
			continue;
		}

		cards.push({
			title: data.title ?? 'Untitled',
			description: data.description ?? '',
			slug,
			badge: getBadge(data.sidebar?.badge)
		});
	}

	return cards;
}

export async function getDocument(path: string, config: RuntimeConfig): Promise<Document> {
	const filePath = await resolveDocumentPath(path, config);

	const source = await readContentFile(filePath, config.content);

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

	const docCards = await getDocCards(slug, config);

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

async function findMarkdownFiles(directory: string, config: RuntimeConfig): Promise<string[]> {
	const entries = await readContentDirectory(directory, config.content);

	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await findMarkdownFiles(fullPath, config)));

			continue;
		}

		if (entry.isFile() && extname(entry.name) === '.md') {
			files.push(fullPath);
		}
	}

	return files;
}

export async function getDocuments(config: RuntimeConfig): Promise<Document[]> {
	const files = await findMarkdownFiles(DOCS_PATH, config);

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
