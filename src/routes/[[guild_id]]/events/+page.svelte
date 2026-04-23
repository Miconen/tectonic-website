<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);
	
	let bingos = $derived(data.events.filter(e => e.name.toLowerCase().includes('bingo') && !e.solo));
	let others = $derived(data.events.filter(e => !(e.name.toLowerCase().includes('bingo') && !e.solo)));
</script>

<svelte:head>
	<title>Events — Tectonic</title>
</svelte:head>

<section class="stack-lg">
	<h1 class="display">Events</h1>

	{#if data.events.length === 0}
		<div class="empty-state">No events recorded.</div>
	{:else}
		{#if bingos.length > 0}
			<div class="stack-sm">
				<h2 class="section-heading">Bingos</h2>
				<div class="table-wrapper">
					<table class="table table-collapse-mobile">
						<thead>
							<tr>
								<th style="padding-left: var(--space-4);">Event Name</th>
								<th style="padding-right: var(--space-4);">Format</th>
							</tr>
						</thead>
						<tbody>
							{#each bingos as e (e.wom_id)}
								<tr>
									<td data-label="Event Name" style="padding-left: var(--space-4);">
										<a href={guildPath(guildId, `/events/${encodeURIComponent(e.wom_id)}`)} style="font-weight: 500;">
											{e.name}
										</a>
									</td>
									<td data-label="Format" class="muted small desktop-only" style="padding-right: var(--space-4);">Team</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		{#if others.length > 0}
			<div class="stack-sm">
				<h2 class="section-heading">Other Events</h2>
				<div class="table-wrapper">
					<table class="table table-collapse-mobile">
						<thead>
							<tr>
								<th style="padding-left: var(--space-4);">Event Name</th>
								<th style="padding-right: var(--space-4);">Format</th>
							</tr>
						</thead>
						<tbody>
							{#each others as e (e.wom_id)}
								<tr>
									<td data-label="Event Name" style="padding-left: var(--space-4);">
										<a href={guildPath(guildId, `/events/${encodeURIComponent(e.wom_id)}`)} style="font-weight: 500;">
											{e.name}
										</a>
									</td>
									<td data-label="Format" class="muted small desktop-only" style="padding-right: var(--space-4);">{e.solo ? 'Solo' : 'Team'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	{/if}
</section>
