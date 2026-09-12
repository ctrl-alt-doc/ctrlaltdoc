<script lang="ts">
	import type { PageData } from './$types';

	import { Header, Sidebar, DocumentPage, TableOfContents } from 'ctrl-alt-doc/components';
	import { getDocumentComponent } from '$lib/document-components';

	let { data }: { data: PageData } = $props();
	let sidebarOpen = $state(false);
</script>

<svelte:head>
	<title>{data.document.title} — {data.site.title}</title>

	<meta name="description" content={data.document.description} />
</svelte:head>

<div class="app">
	<Header
		title={data.site.title}
		logo={data.site.navbar?.logo}
		logoAlt={data.site.navbar?.logoAlt}
		socials={data.site.navbar?.socials}
		bind:sidebarOpen
	/>

	<div class="layout">
		{#if data.site.theme?.sidebar !== false}
			<Sidebar items={data.navigation} currentPath={data.document.slug} open={sidebarOpen} />
		{/if}

		{#if sidebarOpen}
			<button
				class="sidebar-backdrop"
				type="button"
				aria-label="Close navigation"
				onclick={() => (sidebarOpen = false)}
			></button>
		{/if}

		<main>
			<DocumentPage
				document={data.document}
				documentComponent={getDocumentComponent(data.document.slug)}
			/>
		</main>

		<aside class="toc">
			{#if data.document.frontmatter.toc !== false}
				<TableOfContents items={data.toc} />
			{/if}
		</aside>
	</div>
</div>

<style>
	.app {
		min-height: 100vh;
	}

	.layout {
		display: grid;
		grid-template-columns: 260px minmax(0, 1fr) 220px;
	}

	@media (max-width: 1100px) {
		.layout {
			grid-template-columns: 260px minmax(0, 1fr);
		}
	}

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}

	main {
		min-width: 0;
	}
</style>
