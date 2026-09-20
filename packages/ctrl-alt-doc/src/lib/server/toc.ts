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

	return count === 0 ? base : `${base}-${count + 1}`;
}

export function createTableOfContents(markdown: string): TocItem[] {
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

		headings.push({
			id: createHeadingId(title, usedIds),
			title,
			level
		});
	}

	return headings;
}
