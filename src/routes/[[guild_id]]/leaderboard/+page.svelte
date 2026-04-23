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
		<div class="empty-state">No members match.</div>
	{:else}
		<div class="card" style="padding: 0;">
			<table class="table">
				<thead>
					<tr>
						<th style="width: 4rem">Rank</th>
						<th>RSN</th>
						<th>Also known as</th>
						<th class="num">Points</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as u, i (u.user_id)}
						{@const originalIdx = data.leaderboard.indexOf(u)}
						{@const rank = originalIdx + 1}
						{@const primary = u.rsns?.[0]?.rsn ?? u.user_id}
						{@const alts = (u.rsns ?? []).slice(1)}
						<tr>
							<td class={rankClass(rank)}>#{rank}</td>
							<td>
								<a href={guildPath(guildId, `/users/${encodeURIComponent(primary)}`)}>
									{primary}
								</a>
							</td>
							<td class="muted small">
								{alts.map((r) => r.rsn).join(', ') || '—'}
							</td>
							<td class="num mono">{formatPoints(u.points)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
