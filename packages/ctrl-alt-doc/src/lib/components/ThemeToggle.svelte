<script lang="ts">
	import { onMount } from 'svelte';

	type Theme = 'system' | 'light' | 'dark';

	let theme = $state<Theme>('system');

	const getSystemTheme = () =>
		window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

	const applyTheme = (value: Theme) => {
		const resolved = value === 'system' ? getSystemTheme() : value;
		const root = document.documentElement;

		root.dataset.theme = resolved;
		root.classList.toggle('dark', resolved === 'dark');
		root.classList.toggle('dark-theme', resolved === 'dark');

		document.documentElement.style.colorScheme = resolved;

		return resolved;
	};

	const setTheme = (value: Theme) => {
		theme = value;
		localStorage.setItem('ctrlaltdoc-theme', value);
		applyTheme(value);
	};

	const cycleTheme = () => {
		const next: Record<Theme, Theme> = {
			system: 'light',
			light: 'dark',
			dark: 'system'
		};

		setTheme(next[theme]);
	};

	onMount(() => {
		const stored = localStorage.getItem('ctrlaltdoc-theme');

		if (stored === 'light' || stored === 'dark' || stored === 'system') {
			theme = stored;
		}

		applyTheme(theme);

		const media = window.matchMedia('(prefers-color-scheme: dark)');

		const handleChange = () => {
			if (theme === 'system') {
				applyTheme('system');
			}
		};

		media.addEventListener('change', handleChange);

		return () => {
			media.removeEventListener('change', handleChange);
		};
	});

	const label = $derived(
		theme === 'system' ? 'System theme' : theme === 'light' ? 'Light theme' : 'Dark theme'
	);
</script>

<button
	class="theme-toggle"
	type="button"
	aria-label={label}
	title={`${label}. Click to change.`}
	onclick={cycleTheme}
>
	{#if theme === 'dark'}
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.7 6.7 0 0 0 9.8 9.8Z"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	{:else if theme === 'light'}
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8" />
			<path
				d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
			/>
		</svg>
	{:else}
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<rect
				x="3"
				y="4"
				width="18"
				height="14"
				rx="2"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
			/>
			<path
				d="M8 21h8M12 18v3"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
			/>
		</svg>
	{/if}
</button>
