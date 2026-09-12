<script lang="ts">
	import '../app.css';
	import 'ctrl-alt-doc/styles/ctrlaltdoc.css';
	import '../../custom.css';

	import { Footer } from 'ctrl-alt-doc/components';

	let { children, data } = $props();
</script>

{@render children()}

<Footer config={data.site.footer} />
