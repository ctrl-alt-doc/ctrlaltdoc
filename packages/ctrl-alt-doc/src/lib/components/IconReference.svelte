<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { iconDefinitions } from '../icons/definitions.js';

	const brandNames = [
		'brand-github',
		'brand-x',
		'brand-discord',
		'brand-instagram',
		'brand-youtube',
		'brand-linkedin',
		'brand-twitch',
		'brand-reddit',
		'brand-bluesky'
	] as const;

	const uiIcons = Object.keys(iconDefinitions).filter(
		(name) => !brandNames.includes(name as (typeof brandNames)[number])
	) as Array<keyof typeof iconDefinitions>;

	const brandIcons = brandNames.filter(
		(name) => name in iconDefinitions
	) as Array<keyof typeof iconDefinitions>;
</script>

<section class="icon-reference">

	<h2>UI icons</h2>

	<div class="icon-reference-grid">
		{#each uiIcons as name}
			<div class="icon-reference-card">
				<div class="icon-reference-preview">
					<HugeiconsIcon
						icon={iconDefinitions[name]}
						size={30}
						color="currentColor"
						strokeWidth={1.5}
					/>
				</div>

				<code>{name}</code>
			</div>
		{/each}
	</div>

	<h2>Brand icons</h2>

	<div class="icon-reference-grid">
		{#each brandIcons as name}
			<div class="icon-reference-card">
				<div class="icon-reference-preview">
					<HugeiconsIcon
						icon={iconDefinitions[name]}
						size={30}
						color="currentColor"
						strokeWidth={1.5}
					/>
				</div>

				<code>{name}</code>
			</div>
		{/each}
	</div>
</section>
