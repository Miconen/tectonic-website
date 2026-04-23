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
	<title>Tectonic</title>
</svelte:head>

<section class="stack-lg">
	<div class="row-between">
		<div>
			<h1 class="display">Tectonic</h1>
			<p class="muted">OSRS Clan</p>
		</div>
		<div class="cluster">
			<div class="stat-item text-right">
				<span class="tiny muted">Members</span>
				<span class="stat-val">{data.totalMembers}</span>
			</div>
			<div style="width: 1px; height: 2rem; background: var(--color-border); margin: 0 var(--space-2);"></div>
			<div class="stat-item text-right">
				<span class="tiny muted">Recorded PBs</span>
				<span class="stat-val">{data.latestPbs.length}</span>
			</div>
		</div>
	</div>

	<div class="grid-2">
		<!-- Top 5 -->
		<div class="stack-sm">
			<div class="row-between">
				<div class="section-heading" style="margin: 0">Top 5</div>
				<a href={guildPath(guildId, '/leaderboard')} class="small">Full leaderboard →</a>
			</div>
			<div class="card" style="padding: 0;">
				{#if data.top5.length === 0}
					<div class="empty-state">No members yet.</div>
				{:else}
					<div class="table-wrapper">
						<table class="table">
							<tbody>
								{#each data.top5 as u, i (u.user_id)}
									{@const rank = i + 1}
									{@const rsn = u.rsns?.[0]?.rsn ?? u.user_id}
									<tr class="row-rank-{rank}">
										<td class={rankClass(rank)} style="width: 2.5rem; padding-left: var(--space-4);">#{rank}</td>
										<td>
											<a href={guildPath(guildId, `/users/${encodeURIComponent(rsn)}`)} style="font-weight: 500;">
												{rsn}
											</a>
										</td>
										<td class="num mono" style="padding-right: var(--space-4);">{formatPoints(u.points)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>

		<!-- Latest PBs -->
		<div class="stack-sm">
			<div class="row-between">
				<div class="section-heading" style="margin: 0">Latest PBs</div>
				<a href={guildPath(guildId, '/pbs')} class="small">All PBs →</a>
			</div>
			<div class="card" style="padding: 0;">
				{#if data.latestPbs.length === 0}
					<div class="empty-state">No PBs recorded yet.</div>
				{:else}
					<div class="table-wrapper">
						<table class="table table-collapse-mobile">
							<tbody>
								{#each data.latestPbs as pb (pb.run_id)}
									<tr>
										<td style="padding-left: var(--space-4);">
											<div class="stack-sm" style="margin-top: 0;">
												<a href={guildPath(guildId, `/bosses/${encodeURIComponent(pb.boss_name)}`)} style="font-weight: 500;">
													{pb.boss_name}
												</a>
												<div class="cluster cluster-sm">
													{#each pb.holders as rsn (rsn)}
														<UserChip {rsn} />
													{/each}
												</div>
											</div>
										</td>
										<td class="num desktop-only" style="padding-right: var(--space-4);">
											<div class="stack-sm" style="margin-top: 0; align-items: flex-end;">
												<TimeDisplay ticks={pb.time} />
												<span class="muted tiny">{formatDate(pb.date)}</span>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
