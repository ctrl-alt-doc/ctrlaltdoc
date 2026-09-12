<script lang="ts">
	import { onMount } from 'svelte';

	import type { TocItem } from 'ctrl-alt-doc/server';

	let {
		items
	}: {
		items: TocItem[];
	} = $props();

	let activeId = $state('');

	onMount(() => {
		const updateActiveHeading = () => {
			const offset = 140;

			let currentId = '';

			for (const item of items) {
				const heading = document.getElementById(item.id);

				if (!heading) {
					continue;
				}

				if (heading.getBoundingClientRect().top <= offset) {
					currentId = item.id;
				} else {
					break;
				}
			}

			activeId = currentId;
		};

		updateActiveHeading();

		window.addEventListener('scroll', updateActiveHeading, {
			passive: true
		});

		return () => {
			window.removeEventListener('scroll', updateActiveHeading);
		};
	});
</script>

{#if items.length > 0}
	<nav class="toc-nav" aria-label="On this page">
		<span class="toc-label">On this page</span>

		{#each items as item (item.id)}
			<a
				class:subsection={item.level === 3}
				class:active={item.id === activeId}
				href={`#${item.id}`}
			>
				{item.title}
			</a>
		{/each}
	</nav>
{/if}
