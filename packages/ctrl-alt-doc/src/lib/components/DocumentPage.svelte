<script lang="ts">
	import type { BreadcrumbItem, Document, Pagination } from '../server/types';

	import IconReference from './IconReference.svelte';

	import { onMount } from 'svelte';
	import type { Component } from 'svelte';

	import { resolve } from '$app/paths';

	let {
		document,
		documentComponent,
		breadcrumbs = [],
		pagination
	}: {
		document: Document;
		documentComponent?: Component;
		breadcrumbs?: BreadcrumbItem[];
		pagination?: Pagination;
	} = $props();

	async function copyCode(button: HTMLButtonElement) {
		const encoded = button.dataset.code;

		if (!encoded) {
			return;
		}

		const code = decodeURIComponent(encoded);

		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(code);
			} else {
				const textarea = globalThis.document.createElement('textarea');

				textarea.value = code;
				textarea.style.position = 'fixed';
				textarea.style.opacity = '0';

				globalThis.document.body.appendChild(textarea);

				textarea.select();

				globalThis.document.execCommand('copy');

				textarea.remove();
			}

			button.dataset.copied = 'true';

			setTimeout(() => {
				delete button.dataset.copied;
			}, 1500);
		} catch {
			button.dataset.error = 'true';

			setTimeout(() => {
				delete button.dataset.error;
			}, 1500);
		}
	}

	function activateTab(button: HTMLButtonElement) {
		const group = button.closest<HTMLElement>('[data-tabs]');

		if (!group) {
			return;
		}

		const index = button.dataset.tabIndex;

		if (index === undefined) {
			return;
		}

		const buttons = group.querySelectorAll<HTMLButtonElement>('[data-tab-trigger]');

		const panels = group.querySelectorAll<HTMLElement>('[data-tab-panel]');

		buttons.forEach((tab, tabIndex) => {
			const active = String(tabIndex) === index;

			tab.setAttribute('aria-selected', String(active));

			tab.setAttribute('tabindex', active ? '0' : '-1');
		});

		panels.forEach((panel, panelIndex) => {
			panel.hidden = String(panelIndex) !== index;
		});
	}

	function handleTabClick(event: MouseEvent) {
		const target = event.target;

		if (!(target instanceof HTMLElement)) {
			return;
		}

		const button = target.closest<HTMLButtonElement>('[data-tab-trigger]');

		if (button) {
			activateTab(button);
		}
	}

	function handleTabKeydown(event: KeyboardEvent) {
		const target = event.target;

		if (!(target instanceof HTMLButtonElement) || !target.matches('[data-tab-trigger]')) {
			return;
		}

		const group = target.closest<HTMLElement>('[data-tabs]');

		if (!group) {
			return;
		}

		const buttons = [...group.querySelectorAll<HTMLButtonElement>('[data-tab-trigger]')];

		const currentIndex = buttons.indexOf(target);

		if (currentIndex === -1) {
			return;
		}

		let nextIndex: number;

		switch (event.key) {
			case 'ArrowRight':
				nextIndex = (currentIndex + 1) % buttons.length;
				break;

			case 'ArrowLeft':
				nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
				break;

			case 'Home':
				nextIndex = 0;
				break;

			case 'End':
				nextIndex = buttons.length - 1;
				break;

			default:
				return;
		}

		event.preventDefault();

		const nextButton = buttons[nextIndex];

		activateTab(nextButton);
		nextButton.focus();
	}

	onMount(() => {
		const content = globalThis.document.querySelector<HTMLElement>('.content');

		if (!content) {
			return;
		}

		const onTabClick = (event: Event) => {
			handleTabClick(event as MouseEvent);
		};

		const onTabKeydown = (event: Event) => {
			handleTabKeydown(event as KeyboardEvent);
		};

		function handleCopyClick(event: MouseEvent) {
			const target = event.target;

			if (!(target instanceof Element)) {
				return;
			}

			const button = target.closest<HTMLButtonElement>('.copy-code');

			if (!button) {
				return;
			}

			copyCode(button);
		}

		content.addEventListener('click', onTabClick);
		content.addEventListener('keydown', onTabKeydown);
		globalThis.document.addEventListener('click', handleCopyClick);

		return () => {
			content.removeEventListener('click', onTabClick);
			content.removeEventListener('keydown', onTabKeydown);
			globalThis.document.removeEventListener('click', handleCopyClick);
		};
	});
</script>

<div class="document">
	<article>
		<header>
			{#if breadcrumbs.length}
				<nav class="breadcrumbs" aria-label="Breadcrumb">
					{#each breadcrumbs as breadcrumb, index (breadcrumb.slug)}
						{#if index > 0}
							<span class="breadcrumb-separator" aria-hidden="true"> / </span>
						{/if}

						{#if index === breadcrumbs.length - 1}
							<span class="breadcrumb-current">
								{breadcrumb.title}
							</span>
						{:else}
							<a href={resolve(`/${breadcrumb.slug}`)}>
								{breadcrumb.title}
							</a>
						{/if}
					{/each}
				</nav>
			{/if}

		</header>
		<h1>{document.title}</h1>

		<p class="lead">{document.description}</p>
		<div class="divider"></div>

	<div class="content">
	{#if documentComponent}
		{@const DocumentComponent = documentComponent}
		<DocumentComponent />
	{:else}
		{@html document.content}
	{/if}

	{#if document.slug === 'reference/built-in-icons'}
		<IconReference />
	{/if}
</div>

		{#if pagination?.previous || pagination?.next}
			<nav class="pagination" aria-label="Documentation navigation">
				{#if pagination.previous}
					<a class="pagination-link previous" href={resolve(`/${pagination.previous.slug}`)}>
						<span class="pagination-label"> Previous </span>

						<span class="pagination-title">
							← {pagination.previous.title}
						</span>
					</a>
				{/if}

				{#if pagination.next}
					<a class="pagination-link next" href={resolve(`/${pagination.next.slug}`)}>
						<span class="pagination-label"> Next </span>

						<span class="pagination-title">
							{pagination.next.title} →
						</span>
					</a>
				{/if}
			</nav>
		{/if}
	</article>
</div>
