import assert from 'node:assert/strict';
import test from 'node:test';

import { listEndpoint, pageEndpoint, searchEndpoint, suggestEndpoint } from '../dist/api.js';

const config = {
	content: {
		'docs/index.md': '---\ntitle: Home\n---\n\nWelcome.\n',
		'docs/cooking/_category.yml': 'label: Cooking\n',
		'docs/cooking/index.md': '---\ntitle: Cooking\n---\n\nAll about cooking.\n',
		'docs/cooking/eggs.md': '---\ntitle: Cooking eggs\ndescription: Boil and fry.\n---\n\n## Boiling an egg\n\nPlace the egg in water.\n'
	}
};

const call = async (endpoint, path) => {
	const response = await endpoint(() => config)({ url: new URL(path, 'https://docs.example.com') });
	return { status: response.status, body: await response.json() };
};

test('page returns metadata, table of contents, HTML, and Markdown', async () => {
	const { status, body } = await call(pageEndpoint, '/api/page?slug=cooking/eggs');

	assert.equal(status, 200);
	assert.equal(body.title, 'Cooking eggs');
	assert.deepEqual(body.toc, [{ id: 'boiling-an-egg', title: 'Boiling an egg', level: 2 }]);
	assert.match(body.content, /<h2[^>]*id="boiling-an-egg"/);
	assert.match(body.markdown, /^## Boiling an egg/m);
});

test('page reports missing slugs and pages', async () => {
	assert.equal((await call(pageEndpoint, '/api/page')).status, 400);
	assert.equal((await call(pageEndpoint, '/api/page?slug=missing')).status, 404);
});

test('search and suggest use the ranked search', async () => {
	const search = await call(searchEndpoint, '/api/search?q=how%20to%20boil%20an%20egg');
	assert.equal(search.body[0].slug, 'cooking/eggs');
	assert.deepEqual(search.body[0].heading, { id: 'boiling-an-egg', title: 'Boiling an egg' });

	const suggest = await call(suggestEndpoint, '/api/suggest?q=cooking%20e&kind=page');
	assert.deepEqual(suggest.body[0], { title: 'Cooking eggs', slug: 'cooking/eggs' });
});

test('lists pages in a category', async () => {
	const { status, body } = await call(listEndpoint, '/api/list?category=cooking');

	assert.equal(status, 200);
	assert.equal(body.category.slug, 'cooking');
	assert.ok(body.pages.some((page) => page.slug === 'cooking/eggs'));
	assert.equal((await call(listEndpoint, '/api/list?category=missing')).status, 404);
});
