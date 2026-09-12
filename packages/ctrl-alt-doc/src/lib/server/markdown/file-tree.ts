export interface FileTreeNode {
	name: string;
	type: 'file' | 'folder';
	children?: FileTreeNode[];
}

export interface ExtractedFileTrees {
	markdown: string;
	fileTrees: string[];
}

function parseTree(markdown: string): FileTreeNode[] {
	const lines = markdown.split('\n');
	const root: FileTreeNode[] = [];

	const stack: {
		indent: number;
		node: FileTreeNode;
	}[] = [];

	for (const line of lines) {
		if (!line.trim()) {
			continue;
		}

		const match = line.match(/^(\s*)-\s+(.+?)\s*$/);

		if (!match) {
			continue;
		}

		const indent = match[1].replace(/\t/g, '    ').length;
		const name = match[2].trim();
		const isFolder = name.endsWith('/');

		const node: FileTreeNode = {
			name: isFolder ? name.slice(0, -1) : name,
			type: isFolder ? 'folder' : 'file'
		};

		if (isFolder) {
			node.children = [];
		}

		while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
			stack.pop();
		}

		if (stack.length === 0) {
			root.push(node);
		} else {
			const parent = stack[stack.length - 1].node;

			if (!parent.children) {
				parent.children = [];
			}

			parent.children.push(node);
		}

		if (node.type === 'folder') {
			stack.push({
				indent,
				node
			});
		}
	}

	return root;
}

export function extractFileTrees(markdown: string): ExtractedFileTrees {
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

		if (!/^\s*:::file-tree\s*$/.test(line)) {
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

		extracted.push(JSON.stringify(parseTree(body.join('\n'))));

		output.push(`<!--FILE_TREE_${extracted.length - 1}-->`);
	}

	return {
		markdown: output.join('\n'),
		fileTrees: extracted
	};
}
