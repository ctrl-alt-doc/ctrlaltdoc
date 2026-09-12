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
				breadcrumbs={data.breadcrumbs}
				pagination={data.pagination}
			/>
		</main>

		<aside class="toc">
			{#if data.document.frontmatter.toc !== false}
				<TableOfContents items={data.toc} />
			{/if}
		</aside>
	</div>
</div>
