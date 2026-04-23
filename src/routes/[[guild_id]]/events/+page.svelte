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
								<th style="width: 50%; padding-left: var(--space-4);">Event Name</th>
								<th style="width: 20%;">Format</th>
								<th class="num" style="width: 30%; padding-right: var(--space-4);">Winner</th>
							</tr>
						</thead>
						<tbody>
							{#each bingos as e (e.wom_id)}
								<tr>
									<td style="padding-left: var(--space-4);">
										<a href={guildPath(guildId, `/events/${encodeURIComponent(e.wom_id)}`)} class="link-dashed" style="font-weight: 500;">
											{e.name}
										</a>
									</td>
									<td class="muted small desktop-only">Team</td>
									<td class="num" style="padding-right: var(--space-4);">
										{#if e.winner}
											<div class="cluster cluster-sm" style="justify-content: flex-end;">
												<UserChip rsn={e.winner.rsn} display={e.winner.display} points={e.winner.points} />
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
			</div>
		{/if}

		{#if others.length > 0}
			<div class="stack-sm">
				<h2 class="section-heading">Other Events</h2>
				<div class="table-wrapper">
					<table class="table table-collapse-mobile">
						<thead>
							<tr>
								<th style="width: 50%; padding-left: var(--space-4);">Event Name</th>
								<th style="width: 20%;">Format</th>
								<th class="num" style="width: 30%; padding-right: var(--space-4);">Winner</th>
							</tr>
						</thead>
						<tbody>
							{#each others as e (e.wom_id)}
								<tr>
									<td style="padding-left: var(--space-4);">
										<a href={guildPath(guildId, `/events/${encodeURIComponent(e.wom_id)}`)} class="link-dashed" style="font-weight: 500;">
											{e.name}
										</a>
									</td>
									<td class="muted small desktop-only">{e.solo ? 'Solo' : 'Team'}</td>
									<td class="num" style="padding-right: var(--space-4);">
										{#if e.winner}
											<div class="cluster cluster-sm" style="justify-content: flex-end;">
												<UserChip rsn={e.winner.rsn} display={e.winner.display} points={e.winner.points} />
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
			</div>
		{/if}
	{/if}
</section>
