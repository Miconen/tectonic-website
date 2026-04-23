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

	let timeLimit = $state(25);
	let visibleTimes = $derived(data.recentTimes.slice(0, timeLimit));
</script>

<svelte:head>
	<title>{data.primaryRsn} — Tectonic</title>
</svelte:head>

<section class="stack-lg" style="max-width: 64rem; margin-inline: auto;">
	<div class="stack-sm">
		<div class="cluster" style="align-items: baseline; gap: var(--space-4);">
			<h1 class="display" style="font-size: 2.5rem; margin: 0;">{data.primaryRsn}</h1>
			{#if data.user.rank != null}
				<span class={rankClass(data.user.rank)} style="font-size: 1.5rem;">#{data.user.rank}</span>
			{/if}
		</div>
		{#if (data.user.rsns ?? []).length > 1}
			<div class="cluster cluster-sm">
				<span class="muted small">Also known as:</span>
				{#each data.user.rsns.slice(1) as r (r.rsn)}
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
		<div class="stat-item">
			<span class="tiny muted">Achievements</span>
			<span class="stat-val">{(data.user.achievements ?? []).length}</span>
		</div>
		<div class="stat-item">
			<span class="tiny muted">Combat tasks</span>
			<span class="stat-val">{(data.user.combat_achievements ?? []).length}</span>
		</div>
		<div class="stat-item">
			<span class="tiny muted">Total times</span>
			<span class="stat-val">{data.recentTimes.length}</span>
		</div>
	</div>

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
							<th class="desktop-only">Date</th>
							<th class="desktop-only" style="padding-right: 0;">Team</th>
						</tr>
					</thead>
					<tbody>
						{#each data.pbs as pb (pb.run_id)}
							<tr>
								<td style="padding-left: 0;">
									<a href={guildPath(guildId, `/bosses/${encodeURIComponent(pb.boss_name)}`)} style="font-weight: 500;">
										{pb.boss_name}
									</a>
								</td>
								<td class="num"><TimeDisplay ticks={pb.time} /></td>
								<td class="muted small desktop-only">{formatDate(pb.date)}</td>
								<td class="desktop-only" style="padding-right: 0;">
									{#if pb.teammates.length > 0}
										<div class="cluster cluster-sm">
											<span class="muted small">w/</span>
											{#each pb.teammates as rsn (rsn)}
												<UserChip {rsn} />
											{/each}
										</div>
									{:else}
										<span class="muted small">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<hr class="hairline" />

	<!-- Recent times -->
	<div class="stack-sm">
		<div class="row-between">
			<h2 class="section-heading" style="margin: 0;">Recent times</h2>
			{#if data.recentTimes.length > timeLimit}
				<button type="button" class="chip" onclick={() => (timeLimit += 25)} style="cursor: pointer; border: none;">
					Show more
				</button>
			{/if}
		</div>
		{#if data.recentTimes.length === 0}
			<div class="empty-state">No recorded times.</div>
		{:else}
			<div class="table-wrapper">
				<table class="table table-collapse-mobile">
					<thead>
						<tr>
							<th style="padding-left: 0;">Boss</th>
							<th class="num">Time</th>
							<th class="desktop-only">Type</th>
							<th class="desktop-only" style="padding-right: 0;">Date</th>
						</tr>
					</thead>
					<tbody>
						{#each visibleTimes as t (t.run_id)}
							<tr>
								<td style="padding-left: 0;">
									<a href={guildPath(guildId, `/bosses/${encodeURIComponent(t.boss_name)}`)}>
										{t.display_name}
									</a>
								</td>
								<td class="num"><TimeDisplay ticks={t.time} /></td>
								<td class="muted small desktop-only">
									{t.solo ? 'solo' : `${t.team.length + 1}-man`}
								</td>
								<td class="muted small desktop-only" style="padding-right: 0;">{formatDate(t.date)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<div class="grid-2">
		<!-- Achievements -->
		<div class="stack-sm">
			<h2 class="section-heading">Achievements</h2>
			{#if (data.user.achievements ?? []).length === 0}
				<div class="empty-state">None yet.</div>
			{:else}
				<div class="achievement-grid">
					{#each data.user.achievements as a (a.name)}
						<div class="achievement" title={a.name}>
							<img src={a.thumbnail} alt="" loading="lazy" />
							<span>{a.name}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Combat tasks & Events -->
		<div class="stack">
			<div class="stack-sm">
				<h2 class="section-heading">Combat tasks</h2>
				{#if (data.user.combat_achievements ?? []).length === 0}
					<div class="empty-state">None yet.</div>
				{:else}
					<div class="cluster">
						{#each data.user.combat_achievements as ca (ca.name)}
							<span class="badge">{ca.name}</span>
						{/each}
					</div>
				{/if}
			</div>

			<hr class="hairline" />

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
		</div>
	</div>
</section>
