<script lang="ts">
	import { resolve } from '$app/paths';
	import type { FooterConfig } from 'ctrl-alt-doc';
	import { resolveIcon } from '../icons/resolve';

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

	function isExternalLink(href: string): boolean {
		return /^(https?:)?\/\//.test(href);
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
					<a
						href={linkHref(link.href)}
						class:external-link={isExternalLink(link.href)}
						target={isExternalLink(link.href) ? '_blank' : undefined}
						rel={isExternalLink(link.href) ? 'noopener noreferrer' : undefined}
					>
						{link.label}
						{#if isExternalLink(link.href)}
							<svg
								class="external-link-icon"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
								focusable="false"
							>
								{@html resolveIcon('external-link')}
							</svg>
						{/if}
					</a>
				{/each}
			</nav>
		{/if}

		{#if config.showBranding !== false}
			<p class="footer-branding">
				Made with
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					class="external-link"
					href="https://ctrlaltdoc.cc"
					target="_blank"
					rel="noopener noreferrer"
				>
					ctrl alt doc
					<svg
						class="external-link-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
						focusable="false"
					>
						{@html resolveIcon('external-link')}
					</svg>
				</a>
				<span aria-hidden="true">🩷</span>
			</p>
		{/if}
	</footer>
{/if}
