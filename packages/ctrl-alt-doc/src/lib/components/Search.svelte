<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	type SearchResult = {
		title: string;
		description: string;
		slug: string;
		excerpt: string;
	};

	let { title = 'documentation' } = $props();

	let searchInput = $state<HTMLInputElement>();

	let open = $state(false);
	let query = $state('');
	let selected = $state(0);
	let results = $state<SearchResult[]>([]);
	let searching = $state(false);

	let filtered = $derived(results);

	async function search(value: string) {
		query = value;
		selected = 0;

		if (!value.trim()) {
			results = [];
			return;
		}

		searching = true;

		try {
			const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);

			if (!response.ok) {
				results = [];
				return;
			}

			results = await response.json();
		} catch {
			results = [];
		} finally {
			searching = false;
		}
	}

	function openSearch() {
		open = true;
		selected = 0;

		requestAnimationFrame(() => {
			searchInput?.focus();
		});
	}

	function closeSearch() {
		open = false;
		query = '';
		results = [];
		selected = 0;
	}

	function moveSelection(direction: number) {
		if (!filtered.length) return;

		selected = (selected + direction + filtered.length) % filtered.length;
	}

	function selectResult() {
		const result = filtered[selected];

		if (!result) return;

		closeSearch();

		goto(resolve(`/${result.slug}` as `/${string}`));
	}

	function isEditable(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) {
			return false;
		}

		return (
			target.isContentEditable ||
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'SELECT'
		);
	}

	function handleKeydown(event: KeyboardEvent) {
		/*
		 * Slash opens global documentation search.
		 *
		 * Don't intercept it while the user is already
		 * typing in an editable element.
		 */
		if (
			event.key === '/' &&
			!event.metaKey &&
			!event.ctrlKey &&
			!event.altKey &&
			!event.shiftKey &&
			!isEditable(event.target)
		) {
			event.preventDefault();
			openSearch();
			return;
		}

		/*
		 * Keep the familiar Cmd/Ctrl + K shortcut.
		 */
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			openSearch();
			return;
		}

		if (!open) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch();
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveSelection(1);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveSelection(-1);
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			selectResult();
		}
	}

	$effect(() => {
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<button class="search-trigger" onclick={openSearch} aria-label={`Search ${title}`}>
	<span class="placeholder">
		Type <kbd>/</kbd> to search {title}
	</span>
</button>

{#if open}
	<div
		class="overlay"
		role="presentation"
		onclick={(event) => {
			if (event.target === event.currentTarget) {
				closeSearch();
			}
		}}
	>
		<div class="dialog" role="dialog" aria-modal="true" aria-label={`Search ${title}`}>
			<div class="input-wrapper">
				<span class="icon">⌕</span>

				<input
					bind:this={searchInput}
					value={query}
					oninput={(event) => search(event.currentTarget.value)}
					placeholder={`Search ${title}...`}
					aria-label="Search"
				/>

				<kbd>ESC</kbd>
			</div>

			<div class="results">
				{#if searching}
					<p class="empty">Searching...</p>
				{:else if query && !filtered.length}
					<p class="empty">No results found.</p>
				{:else}
					{#each filtered as result, index (result.slug)}
						<button
							class:active={index === selected}
							class="result"
							onclick={() => {
								selected = index;
								selectResult();
							}}
						>
							<span class="result-title">
								{result.title}
							</span>

							{#if result.description}
								<span class="result-description">
									{result.description}
								</span>
							{/if}
						</button>
					{/each}
				{/if}
			</div>

			<footer>
				<span>
					<kbd>↑</kbd>
					<kbd>↓</kbd>
					Navigate
				</span>

				<span>
					<kbd>↵</kbd>
					Open
				</span>

				<span>
					<kbd>ESC</kbd>
					Close
				</span>
			</footer>
		</div>
	</div>
{/if}
