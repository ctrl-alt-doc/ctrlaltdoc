<script lang="ts">
	import { resolve } from '$app/paths';
	import Search from './Search.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import { resolveIcon } from '../icons/resolve';
	import type { SocialLinks } from '../../index';

	const socialIcons: Record<keyof SocialLinks, string> = {
		github: 'brand-github',
		x: 'brand-x',
		discord: 'brand-discord',
		instagram: 'brand-instagram',
		youtube: 'brand-youtube',
		linkedin: 'brand-linkedin',
		twitch: 'brand-twitch',
		reddit: 'brand-reddit',
		bluesky: 'brand-bluesky'
	};

	let {
		title = '',
		logo,
		logoAlt,
		socials,
		sidebarOpen = $bindable(false)
	}: {
		title?: string;
		logo?: {
			light?: string;
			dark?: string;
		};
		logoAlt?: string;
		socials?: SocialLinks;
		sidebarOpen?: boolean;
	} = $props();
</script>

<header class="site-header">
	<div class="header-start">
		<button
			class="sidebar-menu"
			type="button"
			aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
			aria-expanded={sidebarOpen}
			onclick={() => (sidebarOpen = !sidebarOpen)}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				{@html resolveIcon(sidebarOpen ? 'x' : 'menu')}
			</svg>
		</button>

		<a class="brand" href={resolve('/')}>
			{#if logo?.light || logo?.dark}
				{#if logo.light}
					<img class="brand-logo brand-logo-light" src={logo.light} alt={logoAlt ?? title} />
				{/if}

				{#if logo.dark}
					<img class="brand-logo brand-logo-dark" src={logo.dark} alt={logoAlt ?? title} />
				{/if}
			{:else}
				<span class="brand-title">{title}</span>
			{/if}
		</a>
	</div>

	<div class="header-actions">
		{#if socials}
			<nav class="social-links" aria-label="Social links">
				{#each Object.entries(socials) as [platform, href] (platform)}
					{#if href && platform in socialIcons}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a {href} aria-label={platform} target="_blank" rel="noopener noreferrer">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
								focusable="false"
							>
								{@html resolveIcon(socialIcons[platform as keyof SocialLinks])}
							</svg>
						</a>
					{/if}
				{/each}
			</nav>
		{/if}

		<Search {title} />

		<ThemeToggle />
	</div>
</header>
