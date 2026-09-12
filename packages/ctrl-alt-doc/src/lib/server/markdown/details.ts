export interface ExtractedDetails {
	markdown: string;
	details: string[];
}

export function extractDetails(markdown: string): ExtractedDetails {
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

		const detailsMatch = line.match(/^\s*:::details(?:\[(.*?)\])?\s*$/);

		if (!detailsMatch) {
			output.push(line);
			continue;
		}

		const title = detailsMatch[1]?.trim() || 'Details';
		const body: string[] = [];

		index++;

		let depth = 1;

		while (index < lines.length) {
			const currentLine = lines[index];

			if (/^\s*:::\s*$/.test(currentLine)) {
				depth--;

				if (depth === 0) {
					break;
				}

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

		extracted.push(
			JSON.stringify({
				title,
				body: body.join('\n')
			})
		);

		output.push(`<!--DETAILS_${extracted.length - 1}-->`);
	}

	return {
		markdown: output.join('\n'),
		details: extracted
	};
}
