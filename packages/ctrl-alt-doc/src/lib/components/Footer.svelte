<script lang="ts">
	import { resolve } from '$app/paths';
	import type { FooterConfig } from 'ctrl-alt-doc';

	let {
		config
	}: {
		config?: FooterConfig;
	} = $props();

	function linkHref(href: string): string {
		if (/^(https?:\/\/|mailto:|tel:|#)/.test(href)) {
			return href;
		}

		return resolve(href as `/${string}`);
	}
</script>

{#if config}
	<footer class="site-footer">
		{#if config.text}
			<p>{config.text}</p>
		{/if}

		{#if config.links?.length}
			<nav aria-label="Footer">
				{#each config.links as link (link.href)}
					<a href={linkHref(link.href)}>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}

		{#if config.showBranding !== false}
			<p class="footer-branding">
				Made with
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="https://ctrlaltdoc.cc"> ctrl alt doc </a>
				<span aria-hidden="true">🩷</span>
			</p>
		{/if}
	</footer>
{/if}
