export interface ExtractedTabs {
	markdown: string;
	tabs: string[];
}

interface TabItem {
	label: string;
	icon?: string;
	body: string[];
}

export function extractTabs(markdown: string): ExtractedTabs {
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
			} else if (
				fence[0] === codeFence &&
				fence.length >= codeFence.length
			) {
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

		if (!/^\s*:::tabs\s*$/.test(line)) {
			output.push(line);
			continue;
		}

		const tabItems: TabItem[] = [];

		index++;

		let containerDepth = 1;
		let current: TabItem | undefined;

		let tabCodeBlock = false;
		let tabCodeFence = '';

		while (index < lines.length) {
			const currentLine = lines[index];

			const tabFenceMatch = currentLine.match(/^\s*(`{3,}|~{3,})/);

			if (tabFenceMatch) {
				const fence = tabFenceMatch[1];

				if (!tabCodeBlock) {
					tabCodeBlock = true;
					tabCodeFence = fence[0];
				} else if (
					fence[0] === tabCodeFence &&
					fence.length >= tabCodeFence.length
				) {
					tabCodeBlock = false;
					tabCodeFence = '';
				}

				if (current) {
					current.body.push(currentLine);
				}

				index++;
				continue;
			}

			if (tabCodeBlock) {
				if (current) {
					current.body.push(currentLine);
				}

				index++;
				continue;
			}

			if (/^\s*:::\s*$/.test(currentLine)) {
				containerDepth--;

				if (containerDepth === 0) {
					break;
				}

				if (current) {
					current.body.push(currentLine);
				}

				index++;
				continue;
			}

			if (
				/^\s*:::[a-zA-Z][\w-]*(?:\[.*\])?\s*$/.test(currentLine)
			) {
				containerDepth++;

				if (current) {
					current.body.push(currentLine);
				}

				index++;
				continue;
			}

			const tabMatch =
	containerDepth === 1
		? currentLine.match(/^\s*==\s+(?:\[(.+?)\]\s+)?(.+?)\s*$/)
		: null;

			if (tabMatch) {
				if (current) {
					tabItems.push(current);
				}

				current = {
	icon: tabMatch[1],
	label: tabMatch[2],
	body: []
};

				index++;
				continue;
			}

			if (current) {
				current.body.push(currentLine);
			}

			index++;
		}

		if (current) {
			tabItems.push(current);
		}

		extracted.push(JSON.stringify(tabItems));

		output.push(`<!--TABS_${extracted.length - 1}-->`);
	}

	return {
		markdown: output.join('\n'),
		tabs: extracted
	};
}