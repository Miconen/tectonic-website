<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatPoints, rankClass } from '$lib/format/points';
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
		<div class="table-wrapper">
			<table class="table table-collapse-mobile" style="font-size: 0.9375rem;">
				<thead>
					<tr>
						<th style="width: 4rem; padding-left: var(--space-4);">Rank</th>
						<th>Player</th>
						<th class="desktop-only">Known aliases</th>
						<th class="num" style="padding-right: var(--space-4);">Points</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as u, i (u.user_id)}
						{@const originalIdx = data.leaderboard.indexOf(u)}
						{@const rank = originalIdx + 1}
						{@const primary = u.rsns?.[0]?.rsn ?? u.user_id}
						{@const alts = (u.rsns ?? []).slice(1)}
						<tr class={rank <= 3 ? `row-rank-${rank}` : ''}>
							<td class={rankClass(rank)} style="padding-left: var(--space-4);">#{rank}</td>
							<td>
								<a href={guildPath(guildId, `/users/${encodeURIComponent(primary)}`)} style="font-weight: 600;">
									{primary}
								</a>
							</td>
							<td class="muted small desktop-only">
								{alts.map((r) => r.rsn).join(', ') || '—'}
							</td>
							<td class="num mono" style="padding-right: var(--space-4); font-weight: 500;">
								{formatPoints(u.points)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
