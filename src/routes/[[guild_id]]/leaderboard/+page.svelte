<script lang="ts">
	import { page } from '$app/stores';
	import LeaderboardTable from '$lib/components/shared/LeaderboardTable.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);

	let filter = $state('');
	let filtered = $derived.by(() => {
		const f = filter.trim().toLowerCase();
		if (!f) return data.leaderboard;
		return data.leaderboard.filter((u) =>
			u.rsns?.some((r) => r.rsn.toLowerCase().includes(f))
		);
	});
</script>

<svelte:head>
	<title>Leaderboard — Tectonic</title>
</svelte:head>

<section class="stack">
	<div class="row-between">
		<h1 class="display">Leaderboard</h1>
		<input type="search" placeholder="Filter by RSN…" bind:value={filter} />
	</div>

	{#if filtered.length === 0}
		<div class="empty-state">No members match your filter.</div>
	{:else}
		<!-- Find the index offset if filtered, though typically we just show 1..N of the filtered list -->
		<LeaderboardTable users={filtered} {guildId} showAlts={true} />
	{/if}
</section>
