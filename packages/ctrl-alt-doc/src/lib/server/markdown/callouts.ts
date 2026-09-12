export interface CalloutDefinition {
	label?: string;
	icon?: string;
}

export interface ExtractedCallouts {
	markdown: string;
	callouts: string[];
}
export interface RenderedCallout {
	type: string;
	title: string;
	icon?: string;
	body: string;
}
export function extractCallouts(
	markdown: string,
	callouts: Record<string, CalloutDefinition>
): ExtractedCallouts {
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

		const calloutMatch = line.match(
			/^(\s*):::([a-zA-Z0-9_-]+)(?:\[(.+?)\])?\s*$/
		);

		if (!calloutMatch) {
			output.push(line);
			continue;
		}

		const indentation = calloutMatch[1];
		const type = calloutMatch[2];
		const config = callouts[type];

		// Unknown callouts remain ordinary Markdown.
		if (!config) {
			output.push(line);
			continue;
		}

		const body: string[] = [];

		index++;

		while (index < lines.length && !/^\s*:::\s*$/.test(lines[index])) {
			body.push(lines[index]);
			index++;
		}

		const calloutIndex = extracted.length;

		extracted.push(
			JSON.stringify({
				type,
				title: calloutMatch[3] ?? config.label ?? type,
				icon: config.icon,
				body: body.join('\n')
			})
		);

		// Keep the placeholder as Markdown text so it remains inside
		// the surrounding list item when parsed by marked.
		output.push(`<!--CALL_OUT_${extracted.length - 1}-->`);
	}

	return {
		markdown: output.join('\n'),
		callouts: extracted
	};
}