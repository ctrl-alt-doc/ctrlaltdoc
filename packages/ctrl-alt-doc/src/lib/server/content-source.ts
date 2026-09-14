import { readFile, readdir } from 'node:fs/promises';

import { sep } from 'node:path';

export type ContentManifest = Record<string, string>;

export type ContentEntry = {
	name: string;
	isDirectory(): boolean;
	isFile(): boolean;
};

function normalizePath(path: string): string {
	return path.split(sep).join('/').replace(/^\.\//, '');
}

export async function readContentFile(path: string, manifest?: ContentManifest): Promise<string> {
	if (!manifest || Object.keys(manifest).length === 0) {
		return readFile(path, 'utf-8');
	}

	const normalizedPath = normalizePath(path);
	const source = manifest[normalizedPath];

	if (source === undefined) {
		throw new Error(`Content file not found: ${normalizedPath}`);
	}

	return source;
}

export async function readContentDirectory(
	directory: string,
	manifest?: ContentManifest
): Promise<ContentEntry[]> {
	if (!manifest || Object.keys(manifest).length === 0) {
		return readdir(directory, { withFileTypes: true });
	}

	const prefix = `${normalizePath(directory).replace(/\/$/, '')}/`;
	const entries = new Map<string, boolean>();

	for (const path of Object.keys(manifest)) {
		if (!path.startsWith(prefix)) {
			continue;
		}

		const remainder = path.slice(prefix.length);
		const separator = remainder.indexOf('/');
		const name = separator === -1 ? remainder : remainder.slice(0, separator);

		entries.set(name, separator !== -1 || entries.get(name) === true);
	}

	return [...entries]
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([name, directory]) => ({
			name,
			isDirectory: () => directory,
			isFile: () => !directory
		}));
}
