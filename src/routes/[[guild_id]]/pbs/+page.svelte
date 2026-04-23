<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatDate } from '$lib/format/time';
	import TimeDisplay from '$lib/components/TimeDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);

	type SortKey = 'boss' | 'category' | 'time' | 'date';
	let sortKey: SortKey = $state('category');
	let sortAsc: boolean = $state(true);

	function setSort(k: SortKey) {
		if (sortKey === k) sortAsc = !sortAsc;
		else {
			sortKey = k;
			sortAsc = true;
		}
	}

	let sorted = $derived.by(() => {
		const arr = data.rows.slice();
		arr.sort((a, b) => {
			let cmp = 0;
			switch (sortKey) {
				case 'boss':
					cmp = a.display_name.localeCompare(b.display_name);
					break;
				case 'category':
					cmp = a.category.localeCompare(b.category) || a.display_name.localeCompare(b.display_name);
					break;
				case 'time':
					cmp = a.time - b.time;
					break;
				case 'date':
					cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
					break;
			}
			return sortAsc ? cmp : -cmp;
		});
		return arr;
	});
</script>

<svelte:head>
	<title>Clan PBs — Tectonic</title>
</svelte:head>

<section class="stack">
	<h1 class="display">Clan PBs</h1>

	{#if sorted.length === 0}
		<div class="empty-state">No PBs recorded yet.</div>
	{:else}
		<div class="card" style="padding: 0;">
			<table class="table">
				<thead>
					<tr>
						<th style="cursor: pointer;" onclick={() => setSort('boss')}>Boss</th>
						<th style="cursor: pointer;" onclick={() => setSort('category')}>Category</th>
						<th class="num" style="cursor: pointer;" onclick={() => setSort('time')}>Time</th>
						<th>Holders</th>
						<th style="cursor: pointer;" onclick={() => setSort('date')}>Date</th>
					</tr>
				</thead>
				<tbody>
					{#each sorted as row (row.run_id)}
						<tr>
							<td>
								<a href={guildPath(guildId, `/bosses/${encodeURIComponent(row.boss_name)}`)}>
									{row.display_name}
								</a>
							</td>
							<td class="muted small">{row.category}</td>
							<td class="num"><TimeDisplay ticks={row.time} /></td>
							<td>
								<div class="cluster">
									{#each row.holders as rsn (rsn)}
										<UserChip {rsn} />
									{/each}
								</div>
							</td>
							<td class="muted small">{formatDate(row.date)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
