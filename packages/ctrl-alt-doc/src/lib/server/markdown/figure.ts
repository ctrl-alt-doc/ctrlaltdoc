export interface ExtractedFigures {
	markdown: string;
	figures: string[];
}

export interface FigureDefinition {
	src: string;
	alt: string;
	title?: string;
	caption?: string;
}

export function extractFigures(markdown: string): ExtractedFigures {
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

		const figureMatch = line.match(/^\s*:::figure(?:\[(.*?)\])?\s*$/);

		if (!figureMatch) {
			output.push(line);
			continue;
		}

		const body: string[] = [];

		index++;
		let depth = 1;

		while (index < lines.length) {
			const currentLine = lines[index];

			if (/^\s*:::\s*$/.test(currentLine)) {
				depth--;

				if (depth === 0) break;

				body.push(currentLine);
				index++;
				continue;
			}

			if (/^\s*:::[a-zA-Z][\w-]*(?:\[.*\])?\s*$/.test(currentLine)) {
				depth++;
			}

			body.push(currentLine);
			index++;
		}

		const content = body.join('\n').trim();

		const imageMatch = content.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/);

		if (!imageMatch) {
			output.push(line);

			for (const bodyLine of body) {
				output.push(bodyLine);
			}

			if (index < lines.length) {
				output.push(lines[index]);
			}

			continue;
		}

		const [, alt, src, title] = imageMatch;

		const caption = figureMatch[1]?.trim();

		extracted.push(
			JSON.stringify({
				src,
				alt,
				...(title ? { title } : {}),
				...(caption ? { caption } : {})
			} satisfies FigureDefinition)
		);

		output.push(`<!--FIGURE_${extracted.length - 1}-->`);
	}

	return {
		markdown: output.join('\n'),
		figures: extracted
	};
}
