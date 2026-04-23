<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatDate } from '$lib/format/time';
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

<section class="stack-lg">
	<div class="stack-sm">
		<a class="small muted" href={guildPath(guildId, '/bosses')}>← All bosses</a>
		<div class="profile-header">
			<h1 class="display">{data.boss.display_name}</h1>
			<span class="badge">{data.boss.category}</span>
			<span class="badge">{data.boss.solo ? 'Solo' : 'Team'}</span>
		</div>
	</div>

	<div class="card">
		<div class="card-header">Current clan PB</div>
		{#if data.pb}
			<div class="stack-sm">
				<div style="font-size: 2rem;">
					<TimeDisplay ticks={data.pb.time} />
				</div>
				<div class="muted small">Set {formatDate(data.pb.date)}</div>
				<div class="cluster">
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
		<div class="card">
			<div class="card-header">Run history</div>
			<div class="empty-state">Not yet implemented.</div>
		</div>
	{/if}
</section>
