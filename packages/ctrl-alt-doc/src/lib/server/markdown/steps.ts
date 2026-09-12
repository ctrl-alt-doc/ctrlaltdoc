import { marked } from 'marked';

import { extractCallouts, type CalloutDefinition } from './callouts.js';
import { extractTabs } from './tabs.js';
import { escapeHtml } from './utils.js';

export interface ExtractedSteps {
	markdown: string;
	steps: string[];
}
export interface RenderedCallout {
	type: string;
	title: string;
	icon?: string;
	body: string;
}
export interface StepRenderOptions {
	callouts?: Record<string, { label?: string; icon?: string }>;
	renderCallout: (callout: RenderedCallout) => Promise<string>;
	renderMarkdown: (markdown: string) => Promise<string>;
}

export function extractSteps(markdown: string): ExtractedSteps {
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

		if (!/^\s*:::steps\s*$/.test(line)) {
			output.push(line);
			continue;
		}

		const stepItems: string[] = [];

		index++;

		let containerDepth = 1;

		while (index < lines.length) {
			const currentLine = lines[index];

			if (/^\s*:::\s*$/.test(currentLine)) {
				containerDepth--;

				if (containerDepth === 0) {
					break;
				}

				stepItems.push(currentLine);
				index++;
				continue;
			}

			const nestedContainerMatch = currentLine.match(
	/^\s*:::\s*([a-zA-Z][\w-]*)(?:\[(.*?)\])?\s*$/
);

if (nestedContainerMatch) {
	containerDepth++;
}

			stepItems.push(currentLine);
			index++;
		}

		extracted.push(stepItems.join('\n'));

		output.push(`<!--STEPS_${extracted.length - 1}-->`);
	}

	return {
		markdown: output.join('\n'),
		steps: extracted
	};
}

function splitStepItems(markdown: string): string[] {
	const lines = markdown.split('\n');
	const steps: string[] = [];

	let current: string[] = [];
	let currentStep = false;
	let inCodeBlock = false;
	let codeFence = '';

	for (const line of lines) {
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

			if (currentStep) {
				current.push(line);
			}

			continue;
		}

		if (!inCodeBlock) {
			const stepMatch = line.match(/^(\d+)\.\s+(.*)$/);

			if (stepMatch) {
				if (currentStep) {
					steps.push(current.join('\n').trim());
				}

				current = [stepMatch[2]];
				currentStep = true;

				continue;
			}
		}

		if (currentStep) {
			current.push(line);
		}
	}

	if (currentStep) {
		steps.push(current.join('\n').trim());
	}

	return steps;
}

export async function renderSteps(
	markdown: string,
	options: StepRenderOptions
): Promise<string> {
	const stepMarkdown = splitStepItems(markdown);
	const renderedItems: string[] = [];

	for (let stepIndex = 0; stepIndex < stepMarkdown.length; stepIndex++) {
		const stepCallouts = extractCallouts(
			stepMarkdown[stepIndex],
			options.callouts ?? {}
		);

		const stepTabs = extractTabs(stepCallouts.markdown);

		const components = new Map<string, string>();

		for (let tabIndex = 0; tabIndex < stepTabs.tabs.length; tabIndex++) {
			const tabItems = JSON.parse(stepTabs.tabs[tabIndex]);

			const triggers: string[] = [];
			const panels: string[] = [];

			for (let itemIndex = 0; itemIndex < tabItems.length; itemIndex++) {
				const tab = tabItems[itemIndex];
				const id = `tab-step-${stepIndex}-${tabIndex}-${itemIndex}`;

				const renderedBody = await options.renderMarkdown(
					tab.body.join('\n')
				);

				triggers.push(`
					<button
						type="button"
						role="tab"
						id="${id}-tab"
						aria-controls="${id}-panel"
						aria-selected="${itemIndex === 0}"
						tabindex="${itemIndex === 0 ? '0' : '-1'}"
						data-tab-trigger
						data-tab-group="step-${stepIndex}-${tabIndex}"
						data-tab-index="${itemIndex}"
					>
						${escapeHtml(tab.label)}
					</button>
				`);

				panels.push(`
					<div
						role="tabpanel"
						id="${id}-panel"
						aria-labelledby="${id}-tab"
						data-tab-panel
						data-tab-group="step-${stepIndex}-${tabIndex}"
						data-tab-index="${itemIndex}"
						${itemIndex === 0 ? '' : 'hidden'}
					>
						${renderedBody}
					</div>
				`);
			}

			components.set(
				`<!--TABS_${tabIndex}-->`,
				`
					<div
						class="tabs"
						data-tabs
						data-tab-group="step-${stepIndex}-${tabIndex}"
					>
						<div
							class="tabs-list"
							role="tablist"
						>
							${triggers.join('\n')}
						</div>

						${panels.join('\n')}
					</div>
				`
			);
		}

		for (
			let calloutIndex = 0;
			calloutIndex < stepCallouts.callouts.length;
			calloutIndex++
		) {
			const callout = JSON.parse(
	stepCallouts.callouts[calloutIndex]
) as RenderedCallout;

			components.set(
				`<!--CALL_OUT_${calloutIndex}-->`,
				await options.renderCallout(callout)
			);
		}

		const placeholderPattern =
			/(<!--TABS_\d+-->|<!--CALL_OUT_\d+-->)/g;

		const parts = stepTabs.markdown.split(placeholderPattern);
		const renderedParts: string[] = [];

		for (const part of parts) {
			if (!part) {
				continue;
			}

			const component = components.get(part);

			if (component) {
				renderedParts.push(component);
			} else {
				renderedParts.push(
					await options.renderMarkdown(part)
				);
			}
		}

		renderedItems.push(`
			<li>
				${renderedParts.join('\n')}
			</li>
		`);
	}

	return `
		<div
			class="steps"
			data-steps
		>
			<ol>
				${renderedItems.join('\n')}
			</ol>
		</div>
	`;
}