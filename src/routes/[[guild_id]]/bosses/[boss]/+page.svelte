<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatDate } from '$lib/format/time';
	import { formatBossName } from '$lib/format/boss';
	import TimeDisplay from '$lib/components/TimeDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);

	// v2 placeholder: run history requires a new API endpoint. Keep the slot
	// wired up so adding it later is a one-line change.
	const HISTORY_ENABLED = false;
</script>

<svelte:head>
	<title>{data.boss.display_name} — Tectonic</title>
</svelte:head>

<section class="stack-lg" style="max-width: 48rem; margin-inline: auto;">
	<div class="stack-sm">
		<nav aria-label="breadcrumb">
			<a class="small muted" href={guildPath(guildId, '/pbs')}>← Bosses & PBs</a>
		</nav>
		<div class="row-between" style="align-items: baseline;">
			<h1 class="display" style="font-size: 2.5rem; margin: 0;">{formatBossName(data.boss.display_name, data.boss.category, data.boss.solo)}</h1>
			<div class="cluster cluster-sm">
				<span class="badge">{data.boss.category}</span>
				<span class="badge">{data.boss.solo ? 'Solo' : 'Team'}</span>
			</div>
		</div>
	</div>

	<hr class="hairline" />

	<div class="stack-sm">
		<h2 class="section-heading">Current clan PB</h2>
		{#if data.pb}
			<div class="stack" style="margin-top: var(--space-2);">
				<div class="num" style="font-size: 3rem; font-weight: 800; color: var(--color-accent); line-height: 1; text-align: left;">
					<TimeDisplay ticks={data.pb.time} />
				</div>
				<div class="cluster">
					<span class="muted small">Set on {formatDate(data.pb.date)}</span>
					<div style="width: 1px; height: 1rem; background: var(--color-border); margin: 0 var(--space-2);"></div>
					<span class="muted small">Holders:</span>
					{#each data.holders as rsn (rsn)}
						<UserChip {rsn} />
					{/each}
				</div>
			</div>
		{:else}
			<div class="empty-state">No PB recorded for this boss yet.</div>
		{/if}
	</div>

	{#if HISTORY_ENABLED}
		<!-- v2: run history slot. Wire up to a future
		     GET /guilds/{id}/bosses/{boss}/times endpoint. -->
		<hr class="hairline" />
		<div class="stack-sm">
			<h2 class="section-heading">Run history</h2>
			<div class="empty-state">Not yet implemented.</div>
		</div>
	{/if}
</section>
