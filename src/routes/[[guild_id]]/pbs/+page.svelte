<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatDate } from '$lib/format/time';
	import TimeDisplay from '$lib/components/TimeDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);

	let viewMode: 'grouped' | 'flat' = $state('grouped');

	type SortKey = 'boss' | 'category' | 'time' | 'date';
	let sortKey: SortKey = $state('category');
	let sortAsc: boolean = $state(true);

	function setSort(k: SortKey) {
		viewMode = 'flat'; // interacting with headers forces flat view
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
					cmp = a.category_order - b.category_order || a.display_name.localeCompare(b.display_name);
					break;
				case 'time':
					// null times go to bottom
					if (a.time == null && b.time == null) cmp = 0;
					else if (a.time == null) cmp = sortAsc ? 1 : -1;
					else if (b.time == null) cmp = sortAsc ? -1 : 1;
					else cmp = a.time - b.time;
					break;
				case 'date':
					if (a.date == null && b.date == null) cmp = 0;
					else if (a.date == null) cmp = sortAsc ? 1 : -1;
					else if (b.date == null) cmp = sortAsc ? -1 : 1;
					else cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
					break;
			}
			return sortAsc ? cmp : -cmp;
		});
		return arr;
	});

	// For grouped view
	let grouped = $derived.by(() => {
		const map = new Map<string, typeof data.rows>();
		for (const row of data.rows) {
			const arr = map.get(row.category) ?? [];
			arr.push(row);
			map.set(row.category, arr);
		}
		// Sort categories by order of their first item
		const entries = Array.from(map.entries());
		entries.sort((a, b) => a[1][0].category_order - b[1][0].category_order);
		// Sort bosses within categories alphabetically
		for (const [, rows] of entries) {
			rows.sort((a, b) => a.display_name.localeCompare(b.display_name));
		}
		return entries;
	});

	function groupStats(rows: typeof data.rows) {
		const total = rows.length;
		const withPb = rows.filter((r) => r.time != null).length;
		return { total, withPb };
	}
</script>

<svelte:head>
	<title>Bosses & PBs — Tectonic</title>
</svelte:head>

<section class="stack-lg">
	<div class="row-between">
		<h1 class="display">Bosses & PBs</h1>
		<div class="segment-toggle">
			<button
				class="segment-btn {viewMode === 'grouped' ? 'active' : ''}"
				onclick={() => { viewMode = 'grouped'; sortKey = 'category'; sortAsc = true; }}
			>
				Grouped
			</button>
			<button
				class="segment-btn {viewMode === 'flat' ? 'active' : ''}"
				onclick={() => { viewMode = 'flat'; sortKey = 'boss'; sortAsc = true; }}
			>
				Flat
			</button>
		</div>
	</div>

	<div class="table-wrapper">
		<table class="table table-collapse-mobile">
			<thead>
				<tr>
					<th style="cursor: pointer; padding-left: var(--space-4);" onclick={() => setSort('boss')}>Boss</th>
					{#if viewMode === 'flat'}
						<th class="desktop-only" style="cursor: pointer;" onclick={() => setSort('category')}>Category</th>
					{/if}
					<th class="num" style="cursor: pointer;" onclick={() => setSort('time')}>Time</th>
					<th class="desktop-only">Holders</th>
					<th class="desktop-only" style="cursor: pointer; padding-right: var(--space-4);" onclick={() => setSort('date')}>Date</th>
				</tr>
			</thead>
			
			{#if viewMode === 'flat'}
				<tbody>
					{#each sorted as row (row.boss_name)}
						<tr>
							<td style="padding-left: var(--space-4);">
								<a href={guildPath(guildId, `/bosses/${encodeURIComponent(row.boss_name)}`)} style="font-weight: 500;">
									{row.display_name}
								</a>
							</td>
							<td class="muted small desktop-only">{row.category}</td>
							<td class="num">
								<TimeDisplay ticks={row.time} />
								<span class="muted tiny" style="display: block; margin-top: 2px;">{row.solo ? 'SOLO' : 'TEAM'}</span>
							</td>
							<td class="desktop-only">
								{#if row.holders.length > 0}
									<div class="cluster cluster-sm">
										{#each row.holders as rsn (rsn)}
											<UserChip {rsn} />
										{/each}
									</div>
								{:else}
									<span class="muted small">—</span>
								{/if}
							</td>
							<td class="muted small desktop-only" style="padding-right: var(--space-4);">{formatDate(row.date)}</td>
						</tr>
					{/each}
				</tbody>
			{:else}
				{#each grouped as [catName, rows]}
					{@const stats = groupStats(rows)}
					<tbody style="border-top: 1rem solid transparent;">
						<tr style="background: transparent;">
							<td colspan="5" style="padding: var(--space-2) var(--space-4); border-bottom: 2px solid var(--color-border);">
								<div class="cluster" style="gap: var(--space-3);">
									{#if rows[0].category_thumbnail}
										<img src={rows[0].category_thumbnail} alt="" style="width: 1.5rem; height: 1.5rem; object-fit: contain;" />
									{/if}
									<span style="font-weight: 600; font-size: 1rem; color: var(--color-text);">{catName}</span>
									<span class="badge" style="margin-left: auto;">{stats.withPb}/{stats.total} PBs</span>
								</div>
							</td>
						</tr>
						{#each rows as row (row.boss_name)}
							<tr>
								<td style="padding-left: var(--space-4);">
									<a href={guildPath(guildId, `/bosses/${encodeURIComponent(row.boss_name)}`)} style="font-weight: 500;">
										{row.display_name}
									</a>
								</td>
								<td class="num">
									<TimeDisplay ticks={row.time} />
									<span class="muted tiny" style="display: block; margin-top: 2px;">{row.solo ? 'SOLO' : 'TEAM'}</span>
								</td>
								<td class="desktop-only">
									{#if row.holders.length > 0}
										<div class="cluster cluster-sm">
											{#each row.holders as rsn (rsn)}
												<UserChip {rsn} />
											{/each}
										</div>
									{:else}
										<span class="muted small">—</span>
									{/if}
								</td>
								<td class="muted small desktop-only" style="padding-right: var(--space-4);">{formatDate(row.date)}</td>
							</tr>
						{/each}
					</tbody>
				{/each}
			{/if}
		</table>
	</div>
</section>
