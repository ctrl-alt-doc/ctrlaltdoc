import {
	iconDefinitions,
	type BuiltInIcon,
	type IconDefinition
} from './definitions.js';

function renderIconDefinition(icon: IconDefinition): string {
	return icon
		.map(([tag, attributes]) => {
			const attrs = Object.entries(attributes)
				.map(([key, value]) => {
					const attr = key.replace(
						/[A-Z]/g,
						(match) => `-${match.toLowerCase()}`
					);

					return `${attr}="${String(value)
						.replaceAll('&', '&amp;')
						.replaceAll('"', '&quot;')
						.replaceAll('<', '&lt;')
						.replaceAll('>', '&gt;')}"`;
				})
				.join(' ');

			return `<${tag}${attrs ? ` ${attrs}` : ''}></${tag}>`;
		})
		.join('');
}

export function resolveIcon(
	name: string | undefined,
	customIcons: Record<string, string> = {}
): string {
	if (name && name in customIcons) {
		return customIcons[name];
	}

	if (name && name in iconDefinitions) {
		return renderIconDefinition(
			iconDefinitions[name as BuiltInIcon]
		);
	}

	return renderIconDefinition(iconDefinitions.info);
}