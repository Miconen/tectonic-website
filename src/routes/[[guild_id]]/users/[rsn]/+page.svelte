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

<section class="stack-lg">
	<div class="profile-header">
		<h1 class="display">{data.primaryRsn}</h1>
		{#if data.user.rank != null}
			<span class={rankClass(data.user.rank) + ' profile-rank'}>#{data.user.rank}</span>
		{/if}
		<span class="profile-points">{formatPoints(data.user.points)} pts</span>
	</div>

	{#if (data.user.rsns ?? []).length > 1}
		<div class="cluster">
			<span class="muted small">Also known as:</span>
			{#each data.user.rsns.slice(1) as r (r.rsn)}
				<a
					class="chip"
					href="https://wiseoldman.net/players/{encodeURIComponent(r.rsn)}"
					target="_blank"
					rel="noreferrer noopener"
				>
					{r.rsn} ↗
				</a>
			{/each}
		</div>
	{/if}

	<div class="grid-auto" style="align-items: start;">
		<!-- PBs held -->
		<div class="card">
			<div class="card-header">Guild PBs held ({data.pbs.length})</div>
			{#if data.pbs.length === 0}
				<div class="empty-state">No clan PBs yet.</div>
			{:else}
				<table class="table">
					<tbody>
						{#each data.pbs as pb (pb.run_id)}
							<tr>
								<td>
									<a href={guildPath(guildId, `/bosses/${encodeURIComponent(pb.boss_name)}`)}>
										{pb.boss_name}
									</a>
								</td>
								<td class="num"><TimeDisplay ticks={pb.time} /></td>
								<td class="muted small">{formatDate(pb.date)}</td>
							</tr>
							{#if pb.teammates.length > 0}
								<tr>
									<td colspan="3">
										<div class="cluster" style="padding-left: 1rem;">
											<span class="muted small">with</span>
											{#each pb.teammates as rsn (rsn)}
												<UserChip {rsn} />
											{/each}
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<!-- Achievements -->
		<div class="card">
			<div class="card-header">Achievements ({(data.user.achievements ?? []).length})</div>
			{#if (data.user.achievements ?? []).length === 0}
				<div class="empty-state">None yet.</div>
			{:else}
				<div class="achievement-grid">
					{#each data.user.achievements as a (a.name)}
						<div class="achievement" title={a.name}>
							<img src={a.thumbnail} alt={a.name} loading="lazy" />
							<span class="truncate" style="max-width: 100%;">{a.name}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Combat achievements -->
		<div class="card">
			<div class="card-header">
				Combat achievements ({(data.user.combat_achievements ?? []).length})
			</div>
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

		<!-- Events -->
		<div class="card">
			<div class="card-header">Events ({(data.user.events ?? []).length})</div>
			{#if (data.user.events ?? []).length === 0}
				<div class="empty-state">None yet.</div>
			{:else}
				<table class="table">
					<thead>
						<tr>
							<th>Event</th>
							<th class="num">Placement</th>
						</tr>
					</thead>
					<tbody>
						{#each data.user.events as e (e.wom_id)}
							<tr>
								<td>{e.name}</td>
								<td class="num mono">#{e.placement}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>

	<!-- Recent times (wide) -->
	<div class="card">
		<div class="row-between">
			<div class="card-header">Recent times ({data.recentTimes.length})</div>
			{#if data.recentTimes.length > timeLimit}
				<button
					type="button"
					class="chip"
					onclick={() => (timeLimit += 25)}
					style="cursor: pointer;"
				>
					Show more
				</button>
			{/if}
		</div>
		{#if data.recentTimes.length === 0}
			<div class="empty-state">No recorded times.</div>
		{:else}
			<table class="table">
				<thead>
					<tr>
						<th>Boss</th>
						<th class="num">Time</th>
						<th>Team</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					{#each visibleTimes as t (t.run_id)}
						<tr>
							<td>
								<a href={guildPath(guildId, `/bosses/${encodeURIComponent(t.boss_name)}`)}>
									{t.display_name}
								</a>
							</td>
							<td class="num"><TimeDisplay ticks={t.time} /></td>
							<td class="muted small">
								{t.solo ? 'solo' : `${t.team.length + 1}-man`}
							</td>
							<td class="muted small">{formatDate(t.date)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</section>
