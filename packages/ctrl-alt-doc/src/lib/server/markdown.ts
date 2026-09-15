import { marked } from 'marked';

import { dirname, join, normalize } from 'node:path';

import { resolveIcon } from '../icons/resolve.js';

import { renderIcon } from '../icons/render.js';

import { escapeHtml } from './markdown/utils.js';
import { extractTabs } from './markdown/tabs.js';
import { extractSteps, renderSteps } from './markdown/steps.js';
import { extractCallouts } from './markdown/callouts.js';
import { processCodeBlocks } from './markdown/code.js';
import { extractDetails } from './markdown/details.js';
import { extractFileTrees } from './markdown/file-tree.js';

import { extractFigures } from './markdown/figure.js';

import type { DocCard } from './types.js';
import type { FileTreeNode } from './markdown/file-tree.js';

import { extractCards } from './markdown/cards.js';
import type { CardDefinition } from './markdown/cards.js';

import { extractDocCards } from './markdown/doc-cards.js';

import { extractDownloads } from './markdown/downloads.js';
import type { DownloadDefinition } from './markdown/downloads.js';

import type { FigureDefinition } from './markdown/figure.js';

export interface TocItem {
	id: string;
	title: string;
	level: number;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

function createHeadingId(text: string, usedIds: Map<string, number>): string {
	const base = slugify(text);

	const count = usedIds.get(base) ?? 0;

	usedIds.set(base, count + 1);

	if (count === 0) {
		return base;
	}

	return `${base}-${count + 1}`;
}

function getCalloutIcon(
	icon: string | undefined,
	customIcons: Record<string, string> = {}
): string {
	const paths = resolveIcon(icon, customIcons);

	return `
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			${paths}
		</svg>
	`;
}

function createToc(markdown: string): TocItem[] {
	const headings: TocItem[] = [];
	const usedIds = new Map<string, number>();

	const lines = markdown.split('\n');

	for (const line of lines) {
		const match = line.match(/^(#{2,3})\s+(.+)$/);

		if (!match) {
			continue;
		}

		const level = match[1].length;

		const title = match[2].replace(/[*_`]/g, '').trim();

		const id = createHeadingId(title, usedIds);

		headings.push({
			id,
			title,
			level
		});
	}

	return headings;
}

function isExternalLink(href: string): boolean {
	return /^(https?:)?\/\//.test(href);
}

function renderExternalLinkIcon(customIcons: Record<string, string> = {}): string {
	return `<svg
		class="external-link-icon"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		focusable="false"
	>${resolveIcon('external-link', customIcons)}</svg>`;
}

function createRenderer(slug: string, customIcons: Record<string, string> = {}) {
	const renderer = new marked.Renderer();

	const headingIds = new Map<string, number>();

	renderer.heading = ({ tokens, depth }) => {
		const text = tokens
			.map((token) => {
				if ('text' in token) {
					return token.text;
				}

				return '';
			})
			.join('');

		const id = createHeadingId(text, headingIds);

		const anchor =
			depth >= 2 && depth <= 3
				? `
				<a
					class="heading-anchor"
					href="#${id}"
					aria-label="Link to ${escapeHtml(text)}"
				>
					#
				</a>
			`
				: '';

		return `
		<h${depth} id="${id}">
			${text}
			${anchor}
		</h${depth}>
	`;
	};

	renderer.link = ({ href, title, tokens }) => {
		const text = tokens
			.map((token) => {
				if ('text' in token) {
					return token.text;
				}

				return '';
			})
			.join('');

		const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
		const external = isExternalLink(href);

		if (external) {
			return `
				<a
					class="external-link"
					href="${escapeHtml(href)}"
					${titleAttribute}
					target="_blank"
					rel="noopener noreferrer"
				>${text}${renderExternalLinkIcon(customIcons)}</a>
			`;
		}

		if (
			href.startsWith('#') ||
			href.includes(':')
		) {
			return `
				<a
					href="${escapeHtml(href)}"
					${titleAttribute}
				>${text}</a>
			`;
		}

		if (!href.endsWith('.md')) {
			return `
				<a
					href="${escapeHtml(href)}"
					${titleAttribute}
				>${text}</a>
			`;
		}

		const currentDirectory = slug ? dirname(slug) : '';

		const resolved = normalize(join(currentDirectory, href));

		let documentSlug = resolved;

		if (documentSlug === '.' || documentSlug === 'index') {
			documentSlug = '';
		} else {
			documentSlug = documentSlug.replace(/\/index$/, '');
		}

		const route = documentSlug ? `/${documentSlug}` : '/';

		return `
			<a
				href="${escapeHtml(route)}"
				${titleAttribute}
			>${text}</a>
		`;
	};

	renderer.code = ({ text, lang }) => {
		const language = lang?.trim() || 'text';

		const encoded = encodeURIComponent(text);

		return `
			<pre
				data-code-block
				data-language="${escapeHtml(language)}"
				data-code="${encoded}"
			><code>${escapeHtml(text)}</code></pre>
		`;
	};
	renderer.tablecell = ({ text, header, align }) => {
		const tag = header ? 'th' : 'td';
		const alignment = header ? 'center' : (align ?? 'left');

		return `
			<${tag} style="text-align: ${alignment};">
				${marked.parseInline(text)}
			</${tag}>
		`;
	};

	return renderer;
}
function renderFileTree(nodes: FileTreeNode[], icons: Record<string, string> = {}): string {
	return `
		<ul class="file-tree-list">
			${nodes
				.map((node) => {
					const icon = `
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		${node.type === 'folder' ? resolveIcon('folder', icons) : resolveIcon('file', icons)}
	</svg>
`;

					const children =
						node.type === 'folder' && node.children?.length
							? renderFileTree(node.children, icons)
							: '';

					return `
						<li class="file-tree-item file-tree-${node.type}">
							<div class="file-tree-entry">
								<span
									class="file-tree-icon"
									aria-hidden="true"
								>
									${icon}
								</span>

								<span class="file-tree-name">
									${escapeHtml(node.name)}
								</span>
							</div>

							${children}
						</li>
					`;
				})
				.join('\n')}
		</ul>
	`;
}
export async function renderMarkdown(
	markdown: string,
	options: {
		slug: string;
		docCards?: DocCard[];
		callouts?: Record<
			string,
			{
				label?: string;
				icon?: string;
			}
		>;
		icons?: Record<string, string>;
	}
): Promise<{
	content: string;
	toc: TocItem[];
}> {
	const renderer = createRenderer(options.slug, options.icons);
	const extractedDocCards = extractDocCards(markdown);
	const extractedCards = extractCards(extractedDocCards.markdown);
	const extractedDownloads = extractDownloads(extractedCards.markdown);
	const extractedFigures = extractFigures(extractedDownloads.markdown);
	const extractedFileTrees = extractFileTrees(extractedFigures.markdown);
	const extractedSteps = extractSteps(extractedFileTrees.markdown);
	const extractedTabs = extractTabs(extractedSteps.markdown);
	const extractedDetails = extractDetails(extractedTabs.markdown);
	const extractedCallouts = extractCallouts(extractedDetails.markdown, options.callouts ?? {});

	let content = await marked.parse(extractedCallouts.markdown, {
		renderer
	});

	for (let index = 0; index < extractedDetails.details.length; index++) {
		const { title, body } = JSON.parse(extractedDetails.details[index]);

		const renderedBody = await marked.parse(body, {
			renderer
		});

		const details = `
		<details
			class="details"
			data-details
		>
			<summary>
				<span class="details-title">
					${escapeHtml(title)}
				</span>

				<span
					class="details-chevron"
					aria-hidden="true"
				>
					${resolveIcon('chevron-right', options.icons)}
				</span>
			</summary>

			<div class="details-content">
				${renderedBody}
			</div>
		</details>
	`;

		content = content.replace(`<!--DETAILS_${index}-->`, details);
	}
	/*
	 * Render Doc Cards.
	 */
	for (let index = 0; index < extractedDocCards.docCards.length; index++) {
		const cards = options.docCards ?? [];

		const renderedCards = cards
			.map((card) => {
				const badgeClass = card.badge ? `badge-${card.badge.toLowerCase()}` : '';

				return `
					<a
						class="doc-card"
						href="/${escapeHtml(card.slug)}"
					>
						<div class="doc-card-content">
							${card.badge ? `<span class="doc-card-badge ${badgeClass}">${escapeHtml(card.badge)}</span>` : ''}

							<h3 class="doc-card-title">
								${escapeHtml(card.title)}
							</h3>

							${
								card.description
									? `
										<p class="doc-card-description">
											${escapeHtml(card.description)}
										</p>
									`
									: ''
							}
						</div>

						<span
	class="doc-card-arrow"
	aria-hidden="true"
>
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		${resolveIcon('chevron-right', options.icons)}
	</svg>
</span>
					</a>
				`;
			})
			.join('\n');

		const docCards = `
			<div
				class="doc-cards"
				data-doc-cards
			>
				${renderedCards}
			</div>
		`;

		content = content.replace(`<!--DOC_CARDS_${index}-->`, docCards);
	}
	/*
	 * Render Generic Cards.
	 */
	for (let index = 0; index < extractedCards.cards.length; index++) {
		const cards: CardDefinition[] = JSON.parse(extractedCards.cards[index]);

		const renderedCards = cards
			.map((card) => {
				const external = isExternalLink(card.href);

				return `
				<a
					class="card"
					href="${escapeHtml(card.href)}"
					${external ? 'target="_blank" rel="noopener noreferrer"' : ''}
				>
					<div class="card-content">
						<h3 class="card-title">
							${escapeHtml(card.title)}
						</h3>

						${
							card.description
								? `
									<p class="card-description">
										${escapeHtml(card.description)}
									</p>
								`
								: ''
						}
					</div>

					<span
						class="card-arrow"
						aria-hidden="true"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							focusable="false"
						>
							${resolveIcon(external ? 'external-link' : 'chevron-right', options.icons)}
						</svg>
					</span>
				</a>
			`;
			})
			.join('\n');

		const cardsMarkup = `
		<div
			class="cards"
			data-cards
		>
			${renderedCards}
		</div>
	`;

		content = content.replace(`<!--CARDS_${index}-->`, cardsMarkup);
	}
	/*
	 * Render Downloads.
	 */
	for (let index = 0; index < extractedDownloads.downloads.length; index++) {
		const downloads: DownloadDefinition[] = JSON.parse(extractedDownloads.downloads[index]);

		const renderedDownloads = downloads
			.map(
				(download) => `
				<a
					class="download"
					href="${escapeHtml(download.href)}"
					download
				>
					<span class="download-icon" aria-hidden="true">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							focusable="false"
						>
							${resolveIcon('download', options.icons)}
						</svg>
					</span>

					<span class="download-content">
						<span class="download-title">
							${escapeHtml(download.title)}
						</span>

						${
							download.description
								? `
									<span class="download-description">
										${escapeHtml(download.description)}
									</span>
								`
								: ''
						}
					</span>
				</a>
			`
			)
			.join('\n');

		const downloadsMarkup = `
		<div
			class="downloads"
			data-downloads
		>
			${renderedDownloads}
		</div>
	`;

		content = content.replace(`<!--DOWNLOADS_${index}-->`, downloadsMarkup);
	}
	/*
	 * Render Figures.
	 */
	for (let index = 0; index < extractedFigures.figures.length; index++) {
		const figure: FigureDefinition = JSON.parse(extractedFigures.figures[index]);

		const renderedFigure = `
		<figure class="figure">
			<img
				src="${escapeHtml(figure.src)}"
				alt="${escapeHtml(figure.alt)}"
				${figure.title ? `title="${escapeHtml(figure.title)}"` : ''}
			/>

			${
				figure.caption
					? `
						<figcaption>
							${escapeHtml(figure.caption)}
						</figcaption>
					`
					: ''
			}
		</figure>
	`;

		content = content.replace(`<!--FIGURE_${index}-->`, renderedFigure);
	}
	/*
	 * Render File Trees.
	 */
	for (let index = 0; index < extractedFileTrees.fileTrees.length; index++) {
		const nodes: FileTreeNode[] = JSON.parse(extractedFileTrees.fileTrees[index]);

		const fileTree = `
			<div
				class="file-tree"
				data-file-tree
			>
				${renderFileTree(nodes, options.icons)}
			</div>
		`;

		content = content.replace(`<!--FILE_TREE_${index}-->`, fileTree);
	}
	for (let index = 0; index < extractedSteps.steps.length; index++) {
	const steps = await renderSteps(extractedSteps.steps[index], {
		callouts: options.callouts,
		renderMarkdown: async (markdown) =>
			marked.parse(markdown, {
				renderer
			}),
		renderCallout: async (callout) => {
			const { type, title, icon, body } = callout;

			const renderedBody = await marked.parse(body, {
				renderer
			});

			return `
				<aside
					class="callout callout-${type}"
					data-callout="${type}"
				>
					<div class="callout-title">
						<span class="callout-icon">
							${getCalloutIcon(icon ?? type, options.icons)}
						</span>

						<span>
							${escapeHtml(title)}
						</span>
					</div>

					<div class="callout-content">
						${renderedBody}
					</div>
				</aside>
			`;
		}
	});

	content = content.replace(`<!--STEPS_${index}-->`, steps);
}

	/*
	 * Render Tabs.
	 */
	for (let index = 0; index < extractedTabs.tabs.length; index++) {
		const tabItems = JSON.parse(extractedTabs.tabs[index]);

		const triggers: string[] = [];
		const panels: string[] = [];

		for (let tabIndex = 0; tabIndex < tabItems.length; tabIndex++) {
			const tab = tabItems[tabIndex];

			const id = `tab-${index}-${tabIndex}`;

			const tabCallouts = extractCallouts(
	tab.body.join('\n'),
	options.callouts ?? {}
);

let renderedBody = await marked.parse(tabCallouts.markdown, {
	renderer
});

for (let calloutIndex = 0; calloutIndex < tabCallouts.callouts.length; calloutIndex++) {
	const { type, title, icon, body } = JSON.parse(
		tabCallouts.callouts[calloutIndex]
	);

	const renderedCalloutBody = await marked.parse(body, {
		renderer
	});

	const callout = `
		<aside
			class="callout callout-${type}"
			data-callout="${type}"
		>
			<div class="callout-title">
				<span class="callout-icon">
					${getCalloutIcon(icon ?? type, options.icons)}
				</span>

				<span>
					${escapeHtml(title)}
				</span>
			</div>

			<div class="callout-content">
				${renderedCalloutBody}
			</div>
		</aside>
	`;

	renderedBody = renderedBody.replace(
		`<!--CALL_OUT_${calloutIndex}-->`,
		callout
	);
}

			triggers.push(`
				<button
					type="button"
					role="tab"
					id="${id}-tab"
					aria-controls="${id}-panel"
					aria-selected="${tabIndex === 0}"
					tabindex="${tabIndex === 0 ? '0' : '-1'}"
					data-tab-trigger
					data-tab-group="${index}"
					data-tab-index="${tabIndex}"
				>
	${
		tab.icon
			? `
				<span
	class="tabs-icon"
	aria-hidden="true"
>
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		focusable="false"
>
		${resolveIcon(tab.icon, options.icons)}
	</svg>
</span>
			`
			: ''
	}
	<span class="tabs-label">
		${escapeHtml(tab.label)}
	</span>
</button>
			`);

			panels.push(`
				<div
					role="tabpanel"
					id="${id}-panel"
					aria-labelledby="${id}-tab"
					data-tab-panel
					data-tab-group="${index}"
					data-tab-index="${tabIndex}"
					${tabIndex === 0 ? '' : 'hidden'}
				>
					${renderedBody}
				</div>
			`);
		}

		const tabContent = `
			<div
				class="tabs"
				data-tabs
				data-tab-group="${index}"
			>
				<div
					class="tabs-list"
					role="tablist"
				>
					${triggers.join('\n')}
				</div>

				${panels.join('\n')}
			</div>
		`;

		content = content.replace(`<!--TABS_${index}-->`, tabContent);
	}

	/*
	 * Render Callouts.
	 */
	for (let index = 0; index < extractedCallouts.callouts.length; index++) {
		const { type, title, icon, body } = JSON.parse(extractedCallouts.callouts[index]);

		const renderedBody = await marked.parse(body, {
			renderer
		});

		const callout = `
			<aside
				class="callout callout-${type}"
				data-callout="${type}"
			>
				<div class="callout-title">
					<span class="callout-icon">
						${getCalloutIcon(icon ?? type, options.icons)}
					</span>

					<span>
						${escapeHtml(title)}
					</span>
				</div>

				<div class="callout-content">
					${renderedBody}
				</div>
			</aside>
		`;

		content = content.replace(`<!--CALL_OUT_${index}-->`, callout);
	}

	content = await processCodeBlocks(content);

	return {
		content,
		toc: createToc(markdown)
	};
}
