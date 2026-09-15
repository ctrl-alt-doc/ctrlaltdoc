import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const CHECK_INTERVAL = 24 * 60 * 60 * 1000;
const REGISTRY_URL = 'https://registry.npmjs.org/ctrl-alt-doc/latest';

interface UpdateCache {
	checkedAt: number;
	latestVersion?: string;
}

function isDisabled(): boolean {
	return (
		(process.env.CI !== undefined && process.env.CI !== 'false') ||
		process.env.CTRL_ALT_DOC_DISABLE_UPDATE_CHECK === '1'
	);
}

function parseVersion(version: string): number[] | undefined {
	const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-|$)/);

	return match ? match.slice(1).map(Number) : undefined;
}

export function isNewerVersion(current: string, latest: string): boolean {
	const currentParts = parseVersion(current);
	const latestParts = parseVersion(latest);

	if (!currentParts || !latestParts) {
		return false;
	}

	for (let index = 0; index < currentParts.length; index++) {
		if (latestParts[index] !== currentParts[index]) {
			return latestParts[index] > currentParts[index];
		}
	}

	return false;
}

function getPackageManager(root: string): string {
	const userAgent = process.env.npm_config_user_agent ?? '';

	if (userAgent.startsWith('pnpm/') || existsSync(join(root, 'pnpm-lock.yaml'))) {
		return 'pnpm update ctrl-alt-doc';
	}

	if (userAgent.startsWith('yarn/') || existsSync(join(root, 'yarn.lock'))) {
		return 'yarn up ctrl-alt-doc';
	}

	if (userAgent.startsWith('bun/') || existsSync(join(root, 'bun.lock'))) {
		return 'bun update ctrl-alt-doc';
	}

	return 'npm update ctrl-alt-doc';
}

async function getCurrentVersion(): Promise<string> {
	const packageJson = JSON.parse(
		await readFile(new URL('../../../package.json', import.meta.url), 'utf8')
	) as { version: string };

	return packageJson.version;
}

async function readCache(path: string): Promise<UpdateCache | undefined> {
	try {
		return JSON.parse(await readFile(path, 'utf8')) as UpdateCache;
	} catch {
		return undefined;
	}
}

async function writeCache(path: string, cache: UpdateCache): Promise<void> {
	try {
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, JSON.stringify(cache), 'utf8');
	} catch {
		// Update checks must never interfere with the development server.
	}
}

async function fetchLatestVersion(): Promise<string | undefined> {
	try {
		const response = await fetch(REGISTRY_URL, {
			signal: AbortSignal.timeout(3000),
			headers: { accept: 'application/json' }
		});

		if (!response.ok) {
			return undefined;
		}

		const result = (await response.json()) as { version?: unknown };

		return typeof result.version === 'string' ? result.version : undefined;
	} catch {
		return undefined;
	}
}

function formatNotice(current: string, latest: string, command: string): string {
	return [
		'',
		'┌  ctrl alt doc update available',
		'│',
		`│  ${current} → ${latest}`,
		'│',
		`│  Run: ${command}`,
		'└',
		''
	].join('\n');
}

export async function getUpdateNotice(root: string): Promise<string | undefined> {
	if (isDisabled()) {
		return undefined;
	}

	const cachePath = join(root, 'node_modules', '.cache', 'ctrl-alt-doc', 'update.json');
	const cache = await readCache(cachePath);
	let latestVersion = cache?.latestVersion;

	if (!cache || Date.now() - cache.checkedAt >= CHECK_INTERVAL) {
		latestVersion = await fetchLatestVersion();
		await writeCache(cachePath, {
			checkedAt: Date.now(),
			latestVersion
		});
	}

	const currentVersion = await getCurrentVersion();

	if (!latestVersion || !isNewerVersion(currentVersion, latestVersion)) {
		return undefined;
	}

	return formatNotice(currentVersion, latestVersion, getPackageManager(root));
}
