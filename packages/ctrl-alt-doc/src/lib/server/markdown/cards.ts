export interface CardDefinition {
	title: string;
	href: string;
	description: string;
}

export interface ExtractedCards {
	markdown: string;
	cards: string[];
}

export function extractCards(markdown: string): ExtractedCards {
	const lines = markdown.split('\n');
	const output: string[] = [];
	const extracted: string[] = [];

	let inCodeBlock = false;
	let codeFence = '';

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];

		const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);

		if (fenceMatch) {
			const fence = fenceMatch[1];

			if (!inCodeBlock) {
				inCodeBlock = true;
				codeFence = fence[0];
			} else if (fence[0] === codeFence && fence.length >= codeFence.length) {
				inCodeBlock = false;
				codeFence = '';
			}

			output.push(line);
			continue;
		}

		if (inCodeBlock) {
			output.push(line);
			continue;
		}

		if (!/^\s*:::cards\s*$/.test(line)) {
			output.push(line);
			continue;
		}

		const cardLines: string[] = [];

		index++;
		let depth = 1;

		while (index < lines.length) {
			const currentLine = lines[index];

			if (/^\s*:::\s*$/.test(currentLine)) {
				depth--;

				if (depth === 0) break;

				cardLines.push(currentLine);
				index++;
				continue;
			}

			if (/^\s*:::[a-zA-Z][\w-]*(?:\[.*\])?(?:\(.*\))?\s*$/.test(currentLine)) {
				depth++;
			}

			cardLines.push(currentLine);
			index++;
		}

		const cards: CardDefinition[] = [];

		for (let cardIndex = 0; cardIndex < cardLines.length; cardIndex++) {
			const cardMatch = cardLines[cardIndex].match(/^\s*:::card\[(.*?)\]\((.*?)\)\s*$/);

			if (!cardMatch) continue;

			const title = cardMatch[1].trim();
			const href = cardMatch[2].trim();

			const body: string[] = [];

			cardIndex++;

			while (cardIndex < cardLines.length && !/^\s*:::\s*$/.test(cardLines[cardIndex])) {
				body.push(cardLines[cardIndex]);
				cardIndex++;
			}

			cards.push({
				title,
				href,
				description: body.join('\n').trim()
			});
		}

		extracted.push(JSON.stringify(cards));
		output.push(`<!--CARDS_${extracted.length - 1}-->`);
	}

	return {
		markdown: output.join('\n'),
		cards: extracted
	};
}
