<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatDate } from '$lib/format/time';
	import { formatBossName } from '$lib/format/boss';
	import { rankClass } from '$lib/format/points';
	import ValueDisplay from '$lib/components/ValueDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);
</script>

<svelte:head>
	<title>{data.boss.display_name} — Tectonic</title>
</svelte:head>

<section class="stack-lg">
	<div class="stack-sm">
		<nav aria-label="breadcrumb">
			<a class="small muted" href={guildPath(guildId, '/pbs')}>← Bosses & PBs</a>
		</nav>
		<div class="row-between" style="align-items: flex-start;">
			<div class="stack-sm" style="gap: var(--space-2); margin-top: 0;">
				<h1 class="display" style="font-size: 2.5rem; margin: 0;">{data.boss.display_name}</h1>
			</div>
			<div class="cluster cluster-sm" style="margin-top: 8px;">
				<span class="badge">{data.boss.category}</span>
				<span class="badge">{data.boss.solo ? 'Solo' : 'Team'}</span>
			</div>
		</div>
	</div>

	<hr class="hairline" />

	<div class="card" style="padding: 0;">
		{#if data.records.length === 0}
			<div class="empty-state">No records for this boss yet.</div>
		{:else}
			<div class="table-wrapper">
				<table class="table table-collapse-mobile" style="margin-bottom: 0;">
					<thead>
						<tr>
							<th style="width: 4rem; padding-left: var(--space-4);">Rank</th>
							<th class="num">Value</th>
							<th class="desktop-only">Team</th>
							<th class="desktop-only" style="padding-right: var(--space-4);">Date</th>
						</tr>
					</thead>
					<tbody>
						{#each data.records as r, i (r.record_id + '_' + i)}
							<tr class={r.position <= 3 ? `row-rank-${r.position}` : ''}>
								<td data-label="Rank" class="num mono {rankClass(r.position)}" style="padding-left: var(--space-4); text-align: left;">
									#{r.position}
								</td>
								<td data-label="Value" class="num">
									<ValueDisplay value={r.value} type={data.boss.value_type} showBadge={true} />
								</td>
								<td data-label="Team" class="desktop-only">
									{#if r.team.length > 0}
										<div class="cluster cluster-sm">
											{#each r.team as h}
												<UserChip rsn={h.rsn} display={h.display} points={h.points} />
											{/each}
										</div>
									{:else}
										<span class="badge">Solo</span>
									{/if}
								</td>
								<td data-label="Date" class="muted small desktop-only" style="padding-right: var(--space-4);">
									{formatDate(r.date)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>
