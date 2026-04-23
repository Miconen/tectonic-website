<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatPoints, rankClass } from '$lib/format/points';
	import { formatDate } from '$lib/format/time';
	import TimeDisplay from '$lib/components/TimeDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);
</script>

<svelte:head>
	<title>Tectonic — Home</title>
</svelte:head>

<section class="stack-lg">
	<div class="row-between">
		<div>
			<h1 class="display">Tectonic</h1>
			<p class="muted">{data.totalMembers} members tracked</p>
		</div>
	</div>

	<div class="grid-auto">
		<div class="card">
			<div class="row-between">
				<div class="card-header">Top 5</div>
				<a href={guildPath(guildId, '/leaderboard')} class="small">Full leaderboard →</a>
			</div>
			{#if data.top5.length === 0}
				<div class="empty-state">No members yet.</div>
			{:else}
				<table class="table">
					<tbody>
						{#each data.top5 as u, i (u.user_id)}
							{@const rank = i + 1}
							{@const rsn = u.rsns?.[0]?.rsn ?? u.user_id}
							<tr>
								<td class={rankClass(rank)} style="width: 2.5rem">#{rank}</td>
								<td>
									<a href={guildPath(guildId, `/users/${encodeURIComponent(rsn)}`)}>
										{rsn}
									</a>
								</td>
								<td class="num mono">{formatPoints(u.points)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<div class="card">
			<div class="row-between">
				<div class="card-header">Latest PBs</div>
				<a href={guildPath(guildId, '/pbs')} class="small">All PBs →</a>
			</div>
			{#if data.latestPbs.length === 0}
				<div class="empty-state">No PBs recorded yet.</div>
			{:else}
				<table class="table">
					<tbody>
						{#each data.latestPbs as pb (pb.run_id)}
							<tr>
								<td>
									<a href={guildPath(guildId, `/bosses/${encodeURIComponent(pb.boss_name)}`)}>
										{pb.boss_name}
									</a>
								</td>
								<td class="num"><TimeDisplay ticks={pb.time} /></td>
								<td class="muted small">{formatDate(pb.date)}</td>
							</tr>
							<tr>
								<td colspan="3">
									<div class="cluster">
										{#each pb.holders as rsn (rsn)}
											<UserChip {rsn} />
										{/each}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</section>
