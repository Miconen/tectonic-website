<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import TimeDisplay from '$lib/components/TimeDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);
</script>

<svelte:head>
	<title>Bosses — Tectonic</title>
</svelte:head>

<section class="stack-lg">
	<h1 class="display">Bosses</h1>

	{#if data.categories.length === 0}
		<div class="empty-state">No bosses configured yet.</div>
	{/if}

	{#each data.categories as cat (cat.name)}
		<div>
			<div class="category-header">
				{#if cat.thumbnail}
					<img src={cat.thumbnail} alt="" loading="lazy" />
				{/if}
				<h2 class="display">{cat.name}</h2>
			</div>
			<div class="grid-auto">
				{#each cat.bosses as entry (entry.boss.name)}
					<a
						class="tile"
						href={guildPath(guildId, `/bosses/${encodeURIComponent(entry.boss.name)}`)}
					>
						<div class="tile-title">{entry.boss.display_name}</div>
						{#if entry.pbTime != null}
							<div class="tile-pb"><TimeDisplay ticks={entry.pbTime} /></div>
							<div class="cluster">
								{#each entry.holders as rsn (rsn)}
									<UserChip {rsn} />
								{/each}
							</div>
						{:else}
							<div class="tile-pb empty">No PB</div>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	{/each}
</section>
