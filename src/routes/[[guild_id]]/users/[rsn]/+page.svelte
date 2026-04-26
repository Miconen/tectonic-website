<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatPoints, rankClass, formatRankText, getTierForPoints, getRankIconUrl } from '$lib/format/points';
	import type { GuildRankResponse } from '$lib/api/types';
	import PbTable from '$lib/components/shared/PbTable.svelte';
	import StatStrip from '$lib/components/shared/StatStrip.svelte';
	import StatItem from '$lib/components/shared/StatItem.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);
	
	let claimedCAs = $derived((data.user.combat_achievements ?? []).length);
	// Fallback to explicit any array to avoid implicit any errors on complex filter arrays
	let unclaimedCAs = $derived((data.guildCAs ?? []).filter((ca: any) => !data.user.combat_achievements?.find((c: any) => c.name === ca.name)));
	
	let events = $derived((data.user.events ?? []).filter((e: any) => !(e.name.toLowerCase().includes('bingo') && !e.solo)));
	let bingos = $derived((data.user.events ?? []).filter((e: any) => e.name.toLowerCase().includes('bingo') && !e.solo));

	let eventWins = $derived(events.filter((e: any) => e.placement === 1).length);
	let eventSeconds = $derived(events.filter((e: any) => e.placement === 2).length);
	let eventThirds = $derived(events.filter((e: any) => e.placement === 3).length);
	
	let bingoWins = $derived(bingos.filter((e: any) => e.placement === 1).length);
	
	let recordFirsts = $derived(data.pbs.filter((p: any) => p.position === 1).length);
	let recordSeconds = $derived(data.pbs.filter((p: any) => p.position === 2).length);
	let recordThirds = $derived(data.pbs.filter((p: any) => p.position === 3).length);

	let userTier = $derived(data.user.tier);
	let ranks = $derived(($page.data.ranks as GuildRankResponse[]) || []);
	let userIcon = $derived(getRankIconUrl(getTierForPoints(data.user.points, ranks)?.icon));
</script>

<svelte:head>
	<title>{data.primaryRsn} — Tectonic</title>
</svelte:head>

<section class="stack-lg">
	<div class="stack-sm">
		<nav aria-label="breadcrumb">
			<a class="small muted" href={guildPath(guildId, '/leaderboard')}>← Leaderboard</a>
		</nav>
		<div class="cluster" style="align-items: center; gap: var(--space-4);">
			<h1 class="display" style="font-size: 2.5rem; margin: 0; display: inline-flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;">
				{#if data.user.rank != null}
					<span class={rankClass(data.user.rank)} style="font-size: 1.25rem; line-height: 1;">#{data.user.rank}</span>
				{/if}
				<span style="line-height: 1;">{data.discordName ?? data.primaryRsn}</span>
			</h1>
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
				<span class="muted small">All RSNs:</span>
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
		{#if userTier}
			<StatItem label="Rank" value={formatRankText(userTier.name)} icon={userTier.icon} color="var(--color-text)" />
		{/if}
		<StatItem label="Points" value={formatPoints(data.user.points)} color="var(--color-accent)" />
		{#if recordFirsts > 0 || recordSeconds > 0 || recordThirds > 0}
			<div style="width: 1px; height: 2rem; background: var(--color-border); margin: auto var(--space-2);"></div>
			{#if recordFirsts > 0}<StatItem label="Record #1s" value={recordFirsts} color="var(--color-gold)" />{/if}
			{#if recordSeconds > 0}<StatItem label="Record #2s" value={recordSeconds} color="var(--color-silver)" />{/if}
			{#if recordThirds > 0}<StatItem label="Record #3s" value={recordThirds} color="var(--color-bronze)" />{/if}
		{/if}
		<div style="width: 1px; height: 2rem; background: var(--color-border); margin: auto var(--space-2);"></div>
		<StatItem label="Bingo Wins" value={bingoWins} color={bingoWins > 0 ? "var(--color-gold)" : "var(--color-text-muted)"} />
		<StatItem label="Event #1s" value={eventWins} color={eventWins > 0 ? "var(--color-gold)" : "var(--color-text-muted)"} />
		<StatItem label="Event #2s" value={eventSeconds} color={eventSeconds > 0 ? "var(--color-silver)" : "var(--color-text-muted)"} />
		<StatItem label="Event #3s" value={eventThirds} color={eventThirds > 0 ? "var(--color-bronze)" : "var(--color-text-muted)"} />
	</StatStrip>

	<!-- PBs held (Full Width) -->
	<div class="stack-sm">
		<h2 class="section-heading">Guild Records held</h2>
		{#if data.pbs.length === 0}
			<div class="empty-state">No clan records held.</div>
		{:else}
			<PbTable 
				rows={data.pbs} 
				{guildId} 
				contextualBossName={true} 
				bossWrap="single-line" 
				showPosition={true}
				repeatBossName={true}
			/>
		{/if}
	</div>

	<hr class="hairline" />

	<!-- Events -->
	<div class="stack-sm">
		{#if bingos.length > 0}
			<h2 class="section-heading">Bingos</h2>
			<div class="table-wrapper">
				<table class="table">
					<tbody>
						{#each bingos as e (e.wom_id)}
							<tr style={e.placement === 1 ? 'background: color-mix(in srgb, var(--color-gold) 10%, transparent);' : ''}>
								<td data-label="Event Name" style="padding-left: var(--space-4);">
									<a href={guildPath(guildId, `/events/${encodeURIComponent(e.wom_id)}`)} class="link-dashed" style="font-weight: 500;">
										{e.name}
									</a>
								</td>
								<td data-label="Placement" class="num mono {rankClass(e.placement)}" style="padding-right: var(--space-4); font-weight: 600;">
									#{e.placement}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<hr class="hairline" style="margin-top: var(--space-3);" />
		{/if}

		<h2 class="section-heading">Events</h2>
		{#if events.length === 0}
			<div class="empty-state">None yet.</div>
		{:else}
			<div class="table-wrapper">
				<table class="table">
					<tbody>
						{#each events as e (e.wom_id)}
							<tr>
								<td data-label="Event Name" style="padding-left: var(--space-4);">
									<a href={guildPath(guildId, `/events/${encodeURIComponent(e.wom_id)}`)} class="link-dashed" style="font-weight: 500;">
										{e.name}
									</a>
								</td>
								<td data-label="Placement" class="num mono {rankClass(e.placement)}" style="padding-right: var(--space-4); font-weight: 600;">
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

	<!-- CAs -->
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
</section>
