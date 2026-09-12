<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		iconDefinitions,
		type BuiltInIcon
	} from './definitions';

	let {
		name,
		size = 20,
		strokeWidth = 1.5
	}: {
		name: BuiltInIcon;
		size?: number | string;
		strokeWidth?: number;
	} = $props();
</script>

<HugeiconsIcon
	icon={iconDefinitions[name]}
	{size}
	color="currentColor"
	{strokeWidth}
/>