import assert from 'node:assert/strict';
import test from 'node:test';

import { searchDocuments, stem, suggestDocuments, tokenize } from '../dist/lib/server/search.js';

const page = (frontmatter, body) => `---\n${frontmatter}\n---\n\n${body}\n`;

const config = {
	content: {
		'docs/index.md': page('title: Home', 'Welcome to the kitchen docs.'),
		'docs/cooking/eggs.md': page(
			'title: Cooking eggs\ndescription: Boil, fry, and scramble.',
			'## Boiling an egg\n\nPlace the egg in water.\n\n## Frying\n\nHeat the pan first.'
		),
		'docs/cooking/pasta.md': page(
			'title: Pasta\ndescription: Dried and fresh pasta.',
			'## Cooking times\n\nMost dried pasta cooks in ten minutes.'
		),
		'docs/reference/callouts.md': page(
			'title: Callouts\nkeywords: [admonition, notice]',
			'Callouts highlight important information.'
		),
		'docs/reference/installation.md': page('title: Installation', 'Install the package with npm.')
	}
};

const slugs = (results) => results.map((result) => result.slug);

test('stems common inflections to the same root', () => {
	assert.equal(stem('cooking'), 'cook');
	assert.equal(stem('cooked'), 'cook');
	assert.equal(stem('eggs'), 'egg');
	assert.equal(stem('settings'), stem('setting'));
	assert.equal(stem('boxes'), 'box');
	assert.equal(stem('installing'), 'install');
});

test('drops question words unless nothing else remains', () => {
	assert.deepEqual(tokenize('How do I cook an egg?'), ['cook', 'egg']);
	assert.deepEqual(tokenize('how to'), ['how', 'to']);
});

test('matches natural-language questions', async () => {
	const results = await searchDocuments('how to cook an egg', config);

	assert.equal(results[0]?.slug, 'cooking/eggs');
	assert.ok(slugs(results).includes('cooking/pasta'), 'partial matches are still returned');
});

test('links to the heading that best matches the query', async () => {
	const [result] = await searchDocuments('boiling eggs', config);

	assert.equal(result?.slug, 'cooking/eggs');
	assert.deepEqual(result?.heading, { id: 'boiling-an-egg', title: 'Boiling an egg' });
});

test('omits the heading when the title already matches best', async () => {
	const [result] = await searchDocuments('pasta', config);

	assert.equal(result?.slug, 'cooking/pasta');
	assert.equal(result?.heading, undefined);
});

test('tolerates single-letter typos', async () => {
	const [result] = await searchDocuments('instalation', config);

	assert.equal(result?.slug, 'reference/installation');
});

test('matches frontmatter keywords', async () => {
	const [result] = await searchDocuments('admonition', config);

	assert.equal(result?.slug, 'reference/callouts');
});

test('ranks distinctive terms above common ones', async () => {
	const [result] = await searchDocuments('admonition cooking', config);

	assert.equal(result?.slug, 'reference/callouts');
});

test('centres the excerpt on a matched term', async () => {
	const [result] = await searchDocuments('frying', config);

	assert.match(result?.excerpt ?? '', /Frying/);
});

test('returns nothing for blank or unmatched queries', async () => {
	assert.deepEqual(await searchDocuments('   ', config), []);
	assert.deepEqual(await searchDocuments('quantum', config), []);
});

test('suggests pages while the last word is still being typed', async () => {
	const suggestions = await suggestDocuments('cooking e', config);

	assert.deepEqual(suggestions[0], { title: 'Cooking eggs', slug: 'cooking/eggs' });
	assert.ok(!slugs(await suggestDocuments('', config)).includes(''), 'the home page has no slug to open');
});

test('limits suggestions', async () => {
	assert.equal((await suggestDocuments('', config, 2)).length, 2);
});
