import { escapeHtml } from './utils.js';
import { renderIcon } from '../../icons/render.js';
import { codeToHtml } from 'shiki';

export async function processCodeBlocks(content: string): Promise<string> {
	const codeBlocks = [
		...content.matchAll(
			/<pre\s+data-code-block\s+data-language="([^"]+)"\s+data-code="([^"]*)"\s*>\s*<code>[\s\S]*?<\/code>\s*<\/pre>/g
		)
	];

	for (const match of codeBlocks) {
		const language = match[1];

		const encodedCode = match[2];

		const code = decodeURIComponent(encodedCode);

		let highlighted: string;

		try {
			highlighted = await codeToHtml(code, {
				lang: language,
				theme: 'github-dark'
			});
			highlighted = highlighted.replace(/\s+tabindex="0"/g, '');
		} catch {
			highlighted = `
                <pre>
                    <code>${escapeHtml(code)}</code>
                </pre>
            `;
		}

		const replacement = `
			<div
				class="code-block"
				data-language="${escapeHtml(language)}"
			>
				<span class="code-language">
					${escapeHtml(language)}
				</span>

				<button
					type="button"
					class="copy-code"
					data-code="${escapeHtml(encodedCode)}"
					aria-label="Copy code"
				>
					<span class="copy-code-icon copy-icon">
						${renderIcon('copy')}
					</span>

					<span class="copy-code-icon check-icon">
						${renderIcon('check')}
					</span>
				</button>

				${highlighted}
			</div>
		`;

		content = content.replace(match[0], replacement);
	}

	return content;
}
