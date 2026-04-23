<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatPoints, rankClass, getIconForPoints } from '$lib/format/points';
	import PbTable from '$lib/components/shared/PbTable.svelte';
	import StatStrip from '$lib/components/shared/StatStrip.svelte';
	import StatItem from '$lib/components/shared/StatItem.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);
	
	let claimedCAs = $derived((data.user.combat_achievements ?? []).length);
	let unclaimedCAs = $derived((data.guildCAs ?? []).filter((ca) => !data.user.combat_achievements?.find((c) => c.name === ca.name)));
	
	let eventWins = $derived((data.user.events ?? []).filter(e => e.placement === 1).length);
	let eventSeconds = $derived((data.user.events ?? []).filter(e => e.placement === 2).length);
	let eventThirds = $derived((data.user.events ?? []).filter(e => e.placement === 3).length);
	
	let bingoWins = $derived((data.user.events ?? []).filter(e => e.placement === 1 && !e.solo && e.name.toLowerCase().includes('bingo')).length);
	
	let userIcon = $derived(getIconForPoints(data.user.points));
</script>

<svelte:head>
	<title>{data.primaryRsn} — Tectonic</title>
</svelte:head>

<section class="stack-lg" style="max-width: 64rem; margin-inline: auto;">
	<div class="stack-sm">
		<nav aria-label="breadcrumb">
			<a class="small muted" href={guildPath(guildId, '/leaderboard')}>← Leaderboard</a>
		</nav>
		<div class="cluster" style="align-items: center; gap: var(--space-4);">
			<h1 class="display" style="font-size: 2.5rem; margin: 0; display: inline-flex; align-items: center; gap: var(--space-2);">
				{#if userIcon}
					<img src="/icons/Clan_icon_-_{userIcon}.png" alt="" style="width: 26px; height: 26px; image-rendering: pixelated; margin-bottom: 4px;" />
				{/if}
				{data.primaryRsn}
			</h1>
			{#if data.user.rank != null}
				<span class={rankClass(data.user.rank)} style="font-size: 1.5rem;">#{data.user.rank}</span>
			{/if}
			{#if (data.user.achievements ?? []).length > 0}
				<div class="cluster cluster-sm" style="margin-left: var(--space-2);">
					{#each data.user.achievements as a (a.name)}
						<img src={a.thumbnail} alt={a.name} title={a.name} style="width: 2rem; height: 2rem; object-fit: contain; border-radius: var(--radius-sm);" />
					{/each}
				</div>
			{/if}
		</div>
		
		{#if (data.user.rsns ?? []).length > 0}
			<div class="cluster cluster-sm">
				<span class="muted small">RSNs:</span>
				{#each data.user.rsns as r (r.rsn)}
					<a
						class="chip chip-muted"
						href="https://wiseoldman.net/players/{encodeURIComponent(r.rsn)}"
						target="_blank"
						rel="noreferrer noopener"
					>
						{r.rsn} ↗
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Stat strip -->
	<StatStrip>
		<StatItem label="Points" value={formatPoints(data.user.points)} color="var(--color-accent)" />
		<StatItem label="PBs held" value={data.pbs.length} />
		{#if bingoWins > 0}
			<StatItem label="Bingo Wins" value={bingoWins} color="var(--color-gold)" />
		{/if}
		{#if eventWins > 0 || eventSeconds > 0 || eventThirds > 0}
			<div style="width: 1px; height: 2rem; background: var(--color-border); margin: auto var(--space-2);"></div>
			{#if eventWins > 0}<StatItem label="#1s" value={eventWins} color="var(--color-gold)" />{/if}
			{#if eventSeconds > 0}<StatItem label="#2s" value={eventSeconds} color="var(--color-silver)" />{/if}
			{#if eventThirds > 0}<StatItem label="#3s" value={eventThirds} color="var(--color-bronze)" />{/if}
		{/if}
	</StatStrip>

	<div class="grid-2">
		<!-- PBs held -->
		<div class="stack-sm">
			<h2 class="section-heading">Guild PBs held</h2>
			{#if data.pbs.length === 0}
				<div class="empty-state">No clan PBs held.</div>
			{:else}
				<PbTable 
					rows={data.pbs} 
					{guildId} 
					contextualBossName={true} 
					bossWrap="multi-line" 
				/>
			{/if}
		</div>

		<!-- Events & CAs -->
		<div class="stack">
			<div class="stack-sm">
				<h2 class="section-heading">Events</h2>
				{#if (data.user.events ?? []).length === 0}
					<div class="empty-state">None yet.</div>
				{:else}
					<div class="table-wrapper">
						<table class="table">
							<tbody>
								{#each data.user.events as e (e.wom_id)}
									<tr>
										<td style="padding-left: var(--space-4);">{e.name}</td>
										<td class="num mono {rankClass(e.placement)}" style="padding-right: var(--space-4); font-weight: 600;">
											#{e.placement}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

			<hr class="hairline" />

			<div class="stack-sm">
				<details>
					<summary class="section-heading" style="cursor: pointer; user-select: none; margin-bottom: 0;">
						Claimed tasks: {claimedCAs} / {data.guildCAs.length}
					</summary>
					<div class="stack-sm" style="margin-top: var(--space-3);">
						{#if claimedCAs > 0}
							<div class="cluster cluster-sm">
								<span class="muted tiny" style="width: 100%;">Claimed</span>
								{#each data.user.combat_achievements as ca (ca.name)}
									<span class="badge" style="background: var(--color-accent); color: var(--color-accent-contrast); border-color: var(--color-accent);">{ca.name}</span>
								{/each}
							</div>
						{/if}
						{#if unclaimedCAs.length > 0}
							<div class="cluster cluster-sm" style="margin-top: var(--space-2);">
								<span class="muted tiny" style="width: 100%;">Unclaimed</span>
								{#each unclaimedCAs as ca (ca.name)}
									<span class="badge">{ca.name}</span>
								{/each}
							</div>
						{/if}
						{#if claimedCAs === 0 && unclaimedCAs.length === 0}
							<div class="muted small">No tasks available.</div>
						{/if}
					</div>
				</details>
			</div>
		</div>
	</div>
</section>
