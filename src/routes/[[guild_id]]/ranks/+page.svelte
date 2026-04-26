<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatPoints, formatRankIcon, formatRankText } from '$lib/format/points';
	import StatStrip from '$lib/components/shared/StatStrip.svelte';
	import StatItem from '$lib/components/shared/StatItem.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);
</script>

<svelte:head>
	<title>Guild Information — Tectonic</title>
</svelte:head>

<section class="stack-lg">
	<h1 class="display">Guild Information</h1>

	<StatStrip>
		<StatItem label="Members" value={data.guild.user_count} />
		<StatItem label="Recorded Times" value={data.guild.record_count} />
		<StatItem label="Rank Tiers" value={data.ranks.length} />
	</StatStrip>

	<div class="stack-sm">
		<h2 class="section-heading">Clan Ranks</h2>
		
		{#if data.ranks.length === 0}
			<div class="empty-state">No rank tiers configured.</div>
		{:else}
			<div class="table-wrapper">
				<table class="table table-collapse-mobile">
					<thead>
						<tr>
							<th style="width: 60px; padding-left: var(--space-4);">Icon</th>
							<th>Rank Name</th>
							<th class="num" style="padding-right: var(--space-4);">Points Required</th>
						</tr>
					</thead>
					<tbody>
						{#each data.ranks as rank (rank.name)}
							<tr>
								<td data-label="Icon" style="padding-left: var(--space-4); text-align: center;">
									{#if rank.icon}
										<!-- Assuming the rank.icon returned by API maps directly to our local files, 
										     e.g., "Wrath" -> "/icons/Clan_icon_-_Wrath.png" -->
										<img src="/icons/Clan_icon_-_{formatRankIcon(rank.icon)}.png" alt="" style="width: 24px; height: 24px; image-rendering: pixelated; display: block; margin: 0 auto;" />
									{:else}
										<span class="muted">—</span>
									{/if}
								</td>
								<td data-label="Rank Name" style="font-weight: 600;">
									{formatRankText(rank.name)}
								</td>
								<td data-label="Points Required" class="num mono" style="padding-right: var(--space-4); color: var(--color-accent);">
									{formatPoints(rank.min_points)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>
