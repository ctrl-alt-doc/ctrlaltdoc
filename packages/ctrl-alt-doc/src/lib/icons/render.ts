import { resolveIcon } from './resolve.js';
import type { BuiltInIcon } from './definitions.js';

export type { BuiltInIcon } from './definitions.js';

export function renderIcon(
	name: BuiltInIcon,
	className = ''
): string {
	return `
		<svg
			class="${className}"
			viewBox="0 0 24 24"
			width="1em"
			height="1em"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			${resolveIcon(name)}
		</svg>
	`;
}