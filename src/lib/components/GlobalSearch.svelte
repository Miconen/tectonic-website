<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatPoints, rankClass } from '$lib/format/points';
	import { onMount, onDestroy } from 'svelte';

	let guildId = $derived($page.params.guild_id as string | undefined);

	type SearchItem = { rank: number; primaryRsn: string; urlRsn: string; points: number; searchTerms: string };

	let query = $state('');
	let fullRoster = $state<SearchItem[] | null>(null);
	let isFetching = $state(false);
	
	let isOpen = $state(false);
	let mobileExpanded = $state(false);

	let results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q || !fullRoster) return [];
		
		const matches = [];
		for (const u of fullRoster) {
			if (u.searchTerms.includes(q)) {
				matches.push(u);
				if (matches.length >= 6) break;
			}
		}
		return matches;
	});

	async function loadRoster() {
		if (fullRoster || isFetching) return;
		isFetching = true;
		try {
			const res = await fetch(guildPath(guildId, '/api/search'));
			if (res.ok) {
				const data = await res.json();
				fullRoster = data.results;
			}
		} catch (e) {
			console.error("Search index failed to load:", e);
		} finally {
			isFetching = false;
		}
	}

	function handleInput() {
		if (!query.trim()) {
			isOpen = false;
			return;
		}
		isOpen = true;
		loadRoster(); // Safely triggers background load if not already cached
	}

	function handleFocus() {
		loadRoster(); // Prefetch when they click the input
		if (query.trim()) isOpen = true;
	}

	function closeSearch() {
		isOpen = false;
		mobileExpanded = false;
		query = '';
	}

	function handleOutsideClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.global-search')) {
			closeSearch();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleOutsideClick);
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('click', handleOutsideClick);
		}
	});

	$effect(() => {
		// Close and reset dropdown when navigating away
		if ($page.url) {
			closeSearch();
		}
	});
</script>

<div class="global-search" class:mobile-expanded={mobileExpanded}>
	<!-- Mobile search toggle icon -->
	<button
		class="search-toggle desktop-hidden"
		aria-label="Search"
		onclick={() => { mobileExpanded = true; setTimeout(() => document.getElementById('global-search-input')?.focus(), 50); }}
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
	</button>

	<div class="search-container">
		<input
			id="global-search-input"
			type="search"
			placeholder="Search player..."
			bind:value={query}
			oninput={handleInput}
			onfocus={handleFocus}
			autocomplete="off"
		/>
		{#if mobileExpanded}
			<button class="close-mobile desktop-hidden" onclick={closeSearch}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
			</button>
		{/if}
	</div>

	{#if isOpen}
		<div class="search-dropdown">
			{#if !fullRoster}
				<div class="dropdown-msg muted small">Loading...</div>
			{:else if results.length === 0}
				<div class="dropdown-msg muted small">No players found.</div>
			{:else}
				<ul class="result-list">
					{#each results as u (u.urlRsn)}
						<li>
							<a href={guildPath(guildId, `/users/${encodeURIComponent(u.urlRsn)}`)} class="result-item">
								<div class="result-main">
									<span class={rankClass(u.rank)} style="margin-right: var(--space-2); font-size: 0.75rem;">#{u.rank}</span>
									<span style="font-weight: 500;">{u.primaryRsn}</span>
								</div>
								<span class="num mono small muted">{formatPoints(u.points)}</span>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>

<style>
	.global-search {
		position: relative;
		display: flex;
		align-items: center;
		margin-left: auto;
	}

	.search-toggle {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		padding: var(--space-2);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius);
		transition: background 120ms ease, color 120ms ease;
		margin-bottom: 0;
	}
	.search-toggle:hover {
		color: var(--color-text);
		background: var(--color-surface-2);
	}

	.search-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	input[type='search'] {
		padding-left: 1rem;
		width: 14rem;
		height: 2rem;
		margin-bottom: 0;
		border-radius: var(--radius);
		background-image: none !important; /* Disable Pico.css default injected search icon */
	}
	input[type="search"]::-webkit-search-decoration,
	input[type="search"]::-webkit-search-cancel-button,
	input[type="search"]::-webkit-search-results-button,
	input[type="search"]::-webkit-search-results-decoration {
		display: none;
	}

	.close-mobile {
		position: absolute;
		right: var(--space-2);
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		padding: var(--space-1);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
	}

	.search-dropdown {
		position: absolute;
		top: calc(100% + var(--space-2));
		right: 0;
		width: 18rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-2);
		z-index: 100;
		overflow: hidden;
	}

	.dropdown-msg {
		padding: var(--space-3);
		text-align: center;
	}

	.result-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.result-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2) var(--space-3);
		text-decoration: none;
		color: var(--color-text);
		transition: background 120ms ease;
	}

	.result-item:hover {
		background: var(--color-surface-2);
	}
	.result-item:active {
		background: var(--color-surface-2);
	}

	.result-main {
		display: flex;
		align-items: baseline;
	}

	/* Mobile responsive logic */
	@media (max-width: 639px) {
		.desktop-hidden {
			display: flex;
		}
		
		.search-container {
			display: none;
		}

		.mobile-expanded {
			position: static; /* Let dropdown position relate to the header instead */
		}

		.mobile-expanded .search-container {
			display: flex;
			position: absolute;
			left: var(--space-4);
			right: var(--space-4);
			top: 50%;
			transform: translateY(-50%);
			z-index: 10;
			background: var(--color-bg);
		}

		.mobile-expanded input[type='search'] {
			width: 100%;
			max-width: none;
		}
		
		.mobile-expanded .search-dropdown {
			right: var(--space-4);
			left: var(--space-4);
			width: auto;
		}
	}

	@media (min-width: 640px) {
		.desktop-hidden {
			display: none;
		}
	}
</style>
