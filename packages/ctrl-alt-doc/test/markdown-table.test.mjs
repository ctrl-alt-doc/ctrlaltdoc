import assert from 'node:assert/strict';
import test from 'node:test';

import { renderMarkdown } from '../dist/lib/server/markdown.js';
import { createTableOfContents } from '../dist/lib/server/toc.js';

test('preserves Svelte component placeholders in Markdown tables', async () => {
	const result = await renderMarkdown(
		'| Icon | Name |\n| --- | --- |\n| <!--CAD_SVELTE_COMPONENT_0--> | **Academic Cap** |',
		{},
	);

	assert.match(result.content, /<td[^>]*>\s*<!--CAD_SVELTE_COMPONENT_0-->/);
	assert.match(result.content, /<strong>Academic Cap<\/strong>/);
});

test('generates unique IDs for duplicate headings', () => {
	const toc = createTableOfContents('## Fixes\n\n### Fixes\n\n### Fixes');

	assert.deepEqual(
		toc.map(({ id }) => id),
		['fixes', 'fixes-2', 'fixes-3'],
	);
});
