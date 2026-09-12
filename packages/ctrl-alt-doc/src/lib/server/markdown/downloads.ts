export interface DownloadDefinition {
	title: string;
	href: string;
	description: string;
}

export interface ExtractedDownloads {
	markdown: string;
	downloads: string[];
}

export function extractDownloads(markdown: string): ExtractedDownloads {
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

		if (!/^\s*:::downloads\s*$/.test(line)) {
			output.push(line);
			continue;
		}

		const downloadLines: string[] = [];

		index++;
		let depth = 1;

		while (index < lines.length) {
			const currentLine = lines[index];

			if (/^\s*:::\s*$/.test(currentLine)) {
				depth--;

				if (depth === 0) break;

				downloadLines.push(currentLine);
				index++;
				continue;
			}

			if (/^\s*:::[a-zA-Z][\w-]*(?:\[.*\])?(?:\(.*\))?\s*$/.test(currentLine)) {
				depth++;
			}

			downloadLines.push(currentLine);
			index++;
		}

		const downloads: DownloadDefinition[] = [];

		for (let downloadIndex = 0; downloadIndex < downloadLines.length; downloadIndex++) {
			const downloadMatch = downloadLines[downloadIndex].match(
				/^\s*:::download\[(.*?)\]\((.*?)\)\s*$/
			);

			if (!downloadMatch) continue;

			const title = downloadMatch[1].trim();
			const href = downloadMatch[2].trim();

			const body: string[] = [];

			downloadIndex++;

			while (
				downloadIndex < downloadLines.length &&
				!/^\s*:::\s*$/.test(downloadLines[downloadIndex])
			) {
				body.push(downloadLines[downloadIndex]);
				downloadIndex++;
			}

			downloads.push({
				title,
				href,
				description: body.join('\n').trim()
			});
		}

		extracted.push(JSON.stringify(downloads));
		output.push(`<!--DOWNLOADS_${extracted.length - 1}-->`);
	}

	return {
		markdown: output.join('\n'),
		downloads: extracted
	};
}
