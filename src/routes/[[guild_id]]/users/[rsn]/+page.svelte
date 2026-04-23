<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatPoints, rankClass } from '$lib/format/points';
	import { formatDate } from '$lib/format/time';
	import { formatBossName } from '$lib/format/boss';
	import TimeDisplay from '$lib/components/TimeDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);
	
	let claimedCAs = $derived((data.user.combat_achievements ?? []).length);
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
			<h1 class="display" style="font-size: 2.5rem; margin: 0;">{data.primaryRsn}</h1>
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
	<div class="stat-strip">
		<div class="stat-item">
			<span class="tiny muted">Points</span>
			<span class="stat-val" style="color: var(--color-accent);">{formatPoints(data.user.points)}</span>
		</div>
		<div class="stat-item">
			<span class="tiny muted">PBs held</span>
			<span class="stat-val">{data.pbs.length}</span>
		</div>
	</div>

	<div class="grid-2">
		<!-- PBs held -->
		<div class="stack-sm">
			<h2 class="section-heading">Guild PBs held</h2>
			{#if data.pbs.length === 0}
				<div class="empty-state">No clan PBs held.</div>
			{:else}
				<div class="table-wrapper">
					<table class="table table-collapse-mobile">
						<thead>
							<tr>
								<th style="padding-left: 0;">Boss</th>
								<th class="num">Time</th>
								<th class="desktop-only" style="padding-right: 0;">Team</th>
							</tr>
						</thead>
						<tbody>
							{#each data.pbs as pb (pb.run_id)}
								<tr>
									<td style="padding-left: 0;">
										<div class="stack-sm" style="margin-top: 0;">
											<a href={guildPath(guildId, `/bosses/${encodeURIComponent(pb.boss_name)}`)} style="font-weight: 500;">
												{formatBossName(pb.display_name, pb.category, pb.solo)}
											</a>
											<span class="muted tiny desktop-only">{formatDate(pb.date)}</span>
										</div>
									</td>
									<td class="num"><TimeDisplay ticks={pb.time} /></td>
									<td class="desktop-only" style="padding-right: 0;">
										{#if pb.teammates.length > 0}
											<div class="cluster cluster-sm">
												<span class="muted small">w/</span>
												{#each pb.teammates as rsn (rsn)}
													<UserChip {rsn} />
												{/each}
											</div>
										{:else}
											<span class="badge">Solo</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
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
										<td style="padding-left: 0;">{e.name}</td>
										<td class="num mono" style="padding-right: 0; color: var(--color-accent);">#{e.placement}</td>
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
						Claimed tasks: {claimedCAs} / {data.maxCombatAchievements}
					</summary>
					{#if claimedCAs === 0}
						<div class="muted small" style="margin-top: var(--space-3);">No tasks claimed yet.</div>
					{:else}
						<div class="cluster" style="margin-top: var(--space-3);">
							{#each data.user.combat_achievements as ca (ca.name)}
								<span class="badge">{ca.name}</span>
							{/each}
						</div>
					{/if}
				</details>
			</div>
		</div>
	</div>
</section>
