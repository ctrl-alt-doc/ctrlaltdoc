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

export function createTableOfContents(markdown: string): TocItem[] {
	const headings: TocItem[] = [];

	const lines = markdown.split('\n');

	for (const line of lines) {
		const match = line.match(/^(#{2,3})\s+(.+)$/);

		if (!match) {
			continue;
		}

		const level = match[1].length;

		const title = match[2].replace(/[*_`]/g, '').trim();

		headings.push({
			id: slugify(title),
			title,
			level
		});
	}

	return headings;
}
