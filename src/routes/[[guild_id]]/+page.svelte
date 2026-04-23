<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import LeaderboardTable from '$lib/components/shared/LeaderboardTable.svelte';
	import PbTable from '$lib/components/shared/PbTable.svelte';
	import StatStrip from '$lib/components/shared/StatStrip.svelte';
	import StatItem from '$lib/components/shared/StatItem.svelte';
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
			<div class="text-right">
				<span class="tiny muted" style="display: block;">Members</span>
				<span class="mono" style="font-size: 1.125rem; font-weight: 600;">{data.totalMembers}</span>
			</div>
			<div style="width: 1px; height: 2rem; background: var(--color-border); margin: 0 var(--space-2);"></div>
			<div class="text-right">
				<span class="tiny muted" style="display: block;">Recorded PBs</span>
				<span class="mono" style="font-size: 1.125rem; font-weight: 600;">{data.latestPbs.length}</span>
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
					<LeaderboardTable users={data.top5} {guildId} />
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
					<PbTable 
						rows={data.latestPbs} 
						{guildId} 
						contextualBossName={false} 
						bossWrap="multi-line" 
					/>
				{/if}
			</div>
		</div>
	</div>
</section>
