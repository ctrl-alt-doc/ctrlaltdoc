export interface ExtractedDocCards {
	markdown: string;
	docCards: string[];
}

export function extractDocCards(markdown: string): ExtractedDocCards {
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

		if (!/^\s*:::doc-cards\s*$/.test(line)) {
			output.push(line);
			continue;
		}

		index++;

		let depth = 1;

		while (index < lines.length) {
			const currentLine = lines[index];

			if (/^\s*:::\s*$/.test(currentLine)) {
				depth--;

				if (depth === 0) {
					break;
				}

				index++;
				continue;
			}

			if (/^\s*:::[a-zA-Z][\w-]*(?:\[.*\])?\s*$/.test(currentLine)) {
				depth++;
			}

			index++;
		}

		extracted.push('doc-cards');

		output.push(`<!--DOC_CARDS_${extracted.length - 1}-->`);
	}

	return {
		markdown: output.join('\n'),
		docCards: extracted
	};
}
