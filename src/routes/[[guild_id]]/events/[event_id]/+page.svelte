<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { rankClass } from '$lib/format/points';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);
</script>

<svelte:head>
	<title>{data.event.name} — Tectonic</title>
</svelte:head>

<section class="stack-lg">
	<div class="stack-sm">
		<nav aria-label="breadcrumb">
			<a class="small muted" href={guildPath(guildId, '/events')}>← All Events</a>
		</nav>
		<div class="row-between" style="align-items: flex-start;">
			<div class="stack-sm" style="gap: var(--space-2); margin-top: 0;">
				<h1 class="display" style="font-size: 2.5rem; margin: 0;">{data.event.name}</h1>
				<a href="https://wiseoldman.net/competitions/{data.event.wom_id}" target="_blank" rel="noreferrer noopener" class="muted small">
					View on Wise Old Man ↗
				</a>
			</div>
			<div class="cluster cluster-sm" style="margin-top: 8px;">
				<span class="badge">{data.event.solo ? 'Solo' : 'Team'}</span>
			</div>
		</div>
	</div>

	<hr class="hairline" />

	<div class="stack-sm">
		<h2 class="section-heading">Placements</h2>
		{#if data.participations.length === 0}
			<div class="empty-state">No placements recorded for this event.</div>
		{:else}
			<div class="table-wrapper">
				<table class="table">
					<thead>
						<tr>
							<th style="width: 4rem; padding-left: var(--space-4);">Rank</th>
							<th>Player</th>
						</tr>
					</thead>
					<tbody>
						{#each data.participations as p (p.user_id)}
							<tr class={p.placement <= 3 ? `row-rank-${p.placement}` : ''}>
								<td data-label="Rank" class="num mono {rankClass(p.placement)}" style="padding-left: var(--space-4); text-align: left;">
									#{p.placement}
								</td>
								<td data-label="Player">
									<div class="cluster cluster-sm">
										<UserChip rsn={p.rsn} display={p.display} points={p.points} />
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>
