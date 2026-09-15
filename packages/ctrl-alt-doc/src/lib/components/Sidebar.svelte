<script lang="ts">
	import type { NavigationItem } from 'ctrl-alt-doc/server';

	import { resolve } from '$app/paths';

	let {
		items,
		currentPath = '',
		open = false
	}: {
		items: NavigationItem[];
		currentPath?: string;
		open?: boolean;
	} = $props();

	let expanded = $state<Record<string, boolean>>({});

	function isExpanded(item: NavigationItem): boolean {
		return expanded[item.slug] ?? !item.collapsed;
	}

	function toggleCategory(slug: string) {
		expanded[slug] = !isExpanded({
			slug,
			type: 'category',
			title: ''
		} as NavigationItem);
	}
</script>

{#snippet renderItem(item: NavigationItem)}
	{@const isActive = item.slug === currentPath}

	<li>
		{#if item.type === 'category'}
			<div class:active={isActive} class="sidebar-category">
				<a href={resolve(`/${item.slug}`)}>
					{item.title}

					{#if item.badge}
						<span
							class:badge-new={item.badge === 'New'}
							class:badge-updated={item.badge === 'Updated'}
							class:badge-beta={item.badge === 'Beta'}
							class="sidebar-badge"
						>
							{item.badge}
						</span>
					{/if}
				</a>

				{#if item.children?.length}
					<button
						type="button"
						class="sidebar-toggle"
						aria-label={`${isExpanded(item) ? 'Collapse' : 'Expand'} ${item.title}`}
						aria-expanded={isExpanded(item)}
						onclick={() => toggleCategory(item.slug)}
					>
						<span class:expanded={isExpanded(item)} class="chevron" aria-hidden="true"></span>
					</button>
				{/if}
			</div>

			{#if item.children?.length && isExpanded(item)}
				<ul class="children">
					{#each item.children as child (child.slug)}
						{@render renderItem(child)}
					{/each}
				</ul>
			{/if}
		{:else}
			<a href={resolve(`/${item.slug}`)} class:active={isActive}>
				<span>{item.title}</span>

				{#if item.badge}
					<span
						class:badge-new={item.badge === 'New'}
						class:badge-updated={item.badge === 'Updated'}
						class:badge-beta={item.badge === 'Beta'}
						class="sidebar-badge"
					>
						{item.badge}
					</span>
				{/if}
			</a>
		{/if}
	</li>
{/snippet}

<aside class:mobile-open={open}>
	<nav aria-label="Documentation">
		<p class="label">Documentation</p>

		<ul>
			{#each items as item (item.slug)}
				{@render renderItem(item)}
			{/each}
		</ul>
	</nav>
</aside>
