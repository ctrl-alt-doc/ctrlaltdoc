import { getDocuments } from './documents.js';

import type { ContentManifest } from './content-source.js';
import type { Document, SearchResult, SuggestionResult, TocItem } from './types.js';

type RuntimeConfig = {
	callouts?: Record<string, { label?: string; icon?: string }>;
	icons?: Record<string, string>;
	content?: ContentManifest;
};

const DEFAULT_SUGGESTION_LIMIT = 25;

// Question and filler words that carry no meaning for matching,
// so "how to cook an egg" searches for "cook" and "egg".
const STOP_WORDS = new Set([
	'a', 'about', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'by', 'can', 'could', 'do',
	'does', 'for', 'from', 'get', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'me',
	'my', 'of', 'on', 'or', 'should', 'so', 'the', 'there', 'this', 'to', 'use', 'using',
	'was', 'we', 'what', 'when', 'where', 'which', 'who', 'why', 'with', 'would', 'you', 'your'
]);

// Points awarded per query term, by where it matched and how closely.
const FIELD_WEIGHTS = {
	title: { exact: 10, prefix: 6, fuzzy: 4 },
	headings: { exact: 6, prefix: 4, fuzzy: 2 },
	meta: { exact: 4, prefix: 2, fuzzy: 1 },
	body: { exact: 1, prefix: 0.5, fuzzy: 0 }
} as const;

const ALL_TERMS_BONUS = 5;
const TITLE_PHRASE_BONUS = 15;
const HEADING_PHRASE_BONUS = 8;
const BODY_PHRASE_BONUS = 3;

type Field = keyof typeof FIELD_WEIGHTS;
type MatchKind = 'exact' | 'prefix' | 'fuzzy';

interface IndexedDocument {
	document: Document;
	text: string;
	fields: Record<Field, Set<string>>;
	headings: { item: TocItem; tokens: Set<string>; text: string }[];
}

interface ScoredDocument {
	indexed: IndexedDocument;
	score: number;
	heading?: TocItem;
}

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, ' ');
}

function normalize(text: string): string {
	return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function undouble(word: string): string {
	const last = word.at(-1);

	return last && last === word.at(-2) && !'lsz'.includes(last) ? word.slice(0, -1) : word;
}

/** Reduces common English inflections so "cooking", "cooked", and "cooks" all match "cook". */
export function stem(word: string): string {
	let result = word;

	if (result.length > 4 && result.endsWith('ies')) {
		result = `${result.slice(0, -3)}y`;
	} else if (result.length > 4 && /(ss|x|z|ch|sh)es$/.test(result)) {
		result = result.slice(0, -2);
	} else if (result.length > 3 && result.endsWith('s') && !/(ss|us|is)$/.test(result)) {
		result = result.slice(0, -1);
	}

	if (result.length > 5 && result.endsWith('ing')) {
		result = undouble(result.slice(0, -3));
	} else if (result.length > 5 && result.endsWith('ed')) {
		result = undouble(result.slice(0, -2));
	}

	return result;
}

/** Splits text into stemmed search terms, dropping stop words unless nothing else remains. */
export function tokenize(text: string, { keepStopWords = false } = {}): string[] {
	const words = normalize(text).split(' ').filter(Boolean);
	const meaningful = keepStopWords ? words : words.filter((word) => !STOP_WORDS.has(word));

	return (meaningful.length ? meaningful : words).map(stem);
}

function tokenSet(text: string): Set<string> {
	return new Set(tokenize(text, { keepStopWords: true }));
}

/** True when the strings differ by at most one insertion, deletion, substitution, or adjacent swap. */
function withinOneEdit(a: string, b: string): boolean {
	if (a === b) return true;
	if (Math.abs(a.length - b.length) > 1) return false;

	let start = 0;
	while (start < a.length && start < b.length && a[start] === b[start]) start++;

	let endA = a.length - 1;
	let endB = b.length - 1;
	while (endA >= start && endB >= start && a[endA] === b[endB]) {
		endA--;
		endB--;
	}

	const middleA = a.slice(start, endA + 1);
	const middleB = b.slice(start, endB + 1);

	if (middleA.length <= 1 && middleB.length <= 1) return true;

	return middleA.length === 2 && middleB.length === 2 && middleA[0] === middleB[1] && middleA[1] === middleB[0];
}

function matchTerm(term: string, tokens: Set<string>, allowShortPrefix: boolean): MatchKind | undefined {
	if (tokens.has(term)) return 'exact';

	const prefixLength = allowShortPrefix ? 1 : 3;
	let fuzzy = false;

	for (const token of tokens) {
		if (term.length >= prefixLength && token.startsWith(term)) return 'prefix';
		if (!fuzzy && term.length >= 4 && token.length >= 4 && withinOneEdit(term, token)) fuzzy = true;
	}

	return fuzzy ? 'fuzzy' : undefined;
}

function keywordsOf(document: Document): string {
	const keywords = document.frontmatter.keywords;

	return Array.isArray(keywords) ? keywords.join(' ') : (keywords ?? '');
}

function indexDocument(document: Document): IndexedDocument {
	const text = stripHtml(document.content).replace(/\s+/g, ' ').trim();

	return {
		document,
		text,
		fields: {
			title: tokenSet(document.title),
			headings: tokenSet(document.toc.map((item) => item.title).join(' ')),
			meta: tokenSet([document.description, document.excerpt, keywordsOf(document)].join(' ')),
			body: tokenSet(text)
		},
		headings: document.toc.map((item) => ({
			item,
			tokens: tokenSet(item.title),
			text: normalize(item.title)
		}))
	};
}

// Suggestions complete a page title, so body text would only add noise.
const SUGGESTION_FIELDS: Field[] = ['title', 'headings', 'meta'];

/** In suggestion mode the last term is still being typed, so any prefix matches it. */
function termScores(indexed: IndexedDocument, terms: string[], suggestions: boolean): number[] {
	return terms.map((term, index) => {
		const allowShortPrefix = suggestions && index === terms.length - 1;
		const fields = suggestions ? SUGGESTION_FIELDS : (Object.keys(FIELD_WEIGHTS) as Field[]);
		let score = 0;

		for (const field of fields) {
			const kind = matchTerm(term, indexed.fields[field], allowShortPrefix);
			if (kind) score += FIELD_WEIGHTS[field][kind];
		}

		return score;
	});
}

function scoreDocument(
	indexed: IndexedDocument,
	scores: number[],
	rarity: number[],
	phrase: string
): number {
	let score = 0;
	let matchedRarity = 0;

	scores.forEach((termScore, index) => {
		score += termScore * rarity[index]!;
		if (termScore > 0) matchedRarity += rarity[index]!;
	});

	// Coverage is weighted by rarity, so matching the one distinctive word
	// in a question counts for more than matching the common ones.
	const coverage = matchedRarity / rarity.reduce((total, value) => total + value, 0);
	score *= coverage * coverage;

	if (scores.every((termScore) => termScore > 0)) score += ALL_TERMS_BONUS;

	if (phrase.includes(' ')) {
		if (normalize(indexed.document.title).includes(phrase)) score += TITLE_PHRASE_BONUS;
		else if (indexed.headings.some((heading) => heading.text.includes(phrase))) score += HEADING_PHRASE_BONUS;
		else if (normalize(indexed.text).includes(phrase)) score += BODY_PHRASE_BONUS;
	}

	return score;
}

/** The heading matching the most query terms, when it matches more of them than the page title. */
function bestHeading(indexed: IndexedDocument, terms: string[]): TocItem | undefined {
	const count = (tokens: Set<string>) => terms.filter((term) => matchTerm(term, tokens, false)).length;

	let best: TocItem | undefined;
	let bestMatches = count(indexed.fields.title);

	for (const heading of indexed.headings) {
		const matches = count(heading.tokens);

		if (matches > bestMatches) {
			best = heading.item;
			bestMatches = matches;
		}
	}

	return best;
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createExcerpt(text: string, terms: string[]): string {
	const lower = text.toLowerCase();
	const positions = terms
		.map((term) => lower.search(new RegExp(`\\b${escapeRegExp(term)}`)))
		.filter((index) => index >= 0);

	if (!positions.length) {
		return text.slice(0, 160);
	}

	const start = Math.max(0, Math.min(...positions) - 60);

	return text.slice(start, start + 180);
}

function rank(documents: Document[], query: string, { suggestions = false } = {}): ScoredDocument[] {
	const terms = [...new Set(tokenize(query))];
	const phrase = normalize(query);

	if (!terms.length) return [];

	const indexed = documents.map(indexDocument);
	const scores = indexed.map((document) => termScores(document, terms, suggestions));

	// Inverse document frequency: terms found on fewer pages are more distinctive.
	const rarity = terms.map((_, index) => {
		const pages = scores.filter((termScore) => termScore[index]! > 0).length;

		return Math.log(1 + indexed.length / Math.max(pages, 1));
	});

	return indexed
		.flatMap((document, index) => {
			const documentScores = scores[index]!;
			if (!documentScores.some((termScore) => termScore > 0)) return [];

			return [{
				indexed: document,
				score: scoreDocument(document, documentScores, rarity, phrase),
				heading: bestHeading(document, terms)
			}];
		})
		.sort((a, b) => b.score - a.score || a.indexed.document.title.localeCompare(b.indexed.document.title));
}

export async function searchDocuments(
	query: string,
	config: RuntimeConfig
): Promise<SearchResult[]> {
	if (!query.trim()) {
		return [];
	}

	const documents = await getDocuments(config);
	const terms = tokenize(query);

	return rank(documents, query).map(({ indexed, heading }) => ({
		title: indexed.document.title,
		description: indexed.document.description,
		slug: indexed.document.slug,
		excerpt: createExcerpt(indexed.text, terms),
		...(heading ? { heading: { id: heading.id, title: heading.title } } : {})
	}));
}

/** Title suggestions for autocomplete, treating the last word as still being typed. */
export async function suggestDocuments(
	query: string,
	config: RuntimeConfig,
	limit = DEFAULT_SUGGESTION_LIMIT
): Promise<SuggestionResult[]> {
	const documents = (await getDocuments(config)).filter((document) => document.slug);
	const ranked = query.trim()
		? rank(documents, query, { suggestions: true }).map(({ indexed }) => indexed.document)
		: documents;

	return ranked.slice(0, limit).map((document) => ({
		title: document.title,
		slug: document.slug
	}));
}
