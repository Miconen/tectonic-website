<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { formatDate } from '$lib/format/time';
	import { formatBossName, formatBossNameParts } from '$lib/format/boss';
	import { rankClass } from '$lib/format/points';
	import ValueDisplay from '$lib/components/ValueDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let guildId = $derived($page.params.guild_id as string | undefined);

	type SortKey = 'boss' | 'category' | 'value' | 'date';
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
					cmp = a.category_order - b.category_order || a.display_name.localeCompare(b.display_name);
					break;
			case 'value':
				// null values go to bottom
				if (a.value == null && b.value == null) cmp = 0;
				else if (a.value == null) cmp = sortAsc ? 1 : -1;
				else if (b.value == null) cmp = sortAsc ? -1 : 1;
				else cmp = a.value - b.value;
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
		
		// Group by boss within categories
		return entries.map(([catName, rows]) => {
			const bossMap = new Map<string, typeof data.rows>();
			for (const row of rows) {
				const bArr = bossMap.get(row.boss_name) ?? [];
				bArr.push(row);
				bossMap.set(row.boss_name, bArr);
			}
			const bossEntries = Array.from(bossMap.entries());
			bossEntries.sort((a, b) => a[1][0].display_name.localeCompare(b[1][0].display_name));
			return { catName, bossEntries, allRows: rows };
		});
	});

	function groupStats(bossEntries: { length: number }, rows: typeof data.rows) {
		const total = bossEntries.length;
		// Count bosses that have at least one record with a value
		const uniqueBossNamesWithPb = new Set(rows.filter(r => r.value != null).map(r => r.boss_name));
		const withPb = uniqueBossNamesWithPb.size;
		return { total, withPb };
	}

	let expandedBosses: Record<string, boolean> = $state({});
	function toggleBoss(bossName: string) {
		expandedBosses[bossName] = !expandedBosses[bossName];
	}
</script>

<svelte:head>
	<title>Bosses & PBs — Tectonic</title>
</svelte:head>

<section class="stack-lg">
	<div class="row-between">
		<h1 class="display">Bosses & PBs</h1>
	</div>

	<div class="table-wrapper">
		<table class="table table-collapse-mobile">
			<thead>
				<tr>
					<th style="cursor: pointer; padding-left: var(--space-4);" onclick={() => setSort('boss')}>Boss</th>
					<th class="num" style="cursor: pointer;" onclick={() => setSort('value')}>Value</th>
					<th class="desktop-only">Holders</th>
					<th class="desktop-only" style="cursor: pointer; padding-right: var(--space-4);" onclick={() => setSort('date')}>Date</th>
				</tr>
			</thead>
			
			{#each grouped as catGroup, index}
				{@const catName = catGroup.catName}
				{@const bossEntries = catGroup.bossEntries}
				{@const stats = groupStats(bossEntries, catGroup.allRows)}
				<tbody>
					{#if index > 0}
						<tr><td colspan="4" style="height: 2rem; padding: 0; border: none;"></td></tr>
					{/if}
					<tr style="background: transparent;">
						<td colspan="4" style="padding: var(--space-2) var(--space-4); border-bottom: 2px solid var(--color-border); border-top: none;">
							<div class="cluster" style="gap: var(--space-3);">
								{#if catGroup.allRows[0].category_thumbnail}
									<img src={catGroup.allRows[0].category_thumbnail} alt="" style="width: 2rem; height: 2rem; object-fit: contain;" />
								{/if}
								<span style="font-weight: 600; font-size: 1.125rem; color: var(--color-text);">{catName}</span>
								<span class="badge" style="margin-left: auto;">{stats.withPb}/{stats.total} Bosses</span>
							</div>
						</td>
					</tr>
						{#each bossEntries as [bossName, records] (bossName)}
							{@const topRecord = records[0]}
							{@const isExpanded = expandedBosses[bossName]}
							{@const hasMore = records.length > 1}
							{@const parts = formatBossNameParts(topRecord.display_name, topRecord.category)}
							<tr class={topRecord.position <= 3 ? `row-rank-${topRecord.position}` : ''} style="cursor: {hasMore ? 'pointer' : 'default'};" onclick={() => hasMore && toggleBoss(bossName)}>
								<td data-label="Boss" style="padding-left: var(--space-4);">
									<div class="row-between" style="gap: var(--space-2);">
										<div class="cluster cluster-sm">
											{#if isExpanded}
												<span class="num mono {rankClass(topRecord.position)}">#{topRecord.position}</span>
											{/if}
											<a href={guildPath(guildId, `/bosses/${encodeURIComponent(topRecord.boss_name)}`)} style="font-weight: 500; color: var(--color-text-muted);" onclick={(e) => e.stopPropagation()}>
												{#if parts.categoryText}
													<span class="muted">{parts.categoryText}</span>
												{/if}
												<span style="color: var(--color-text);">{parts.bossText}</span>
											</a>
										</div>
										{#if hasMore}
											<div class="muted chevron" class:expanded={isExpanded} style="display: flex; align-items: center;">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
											</div>
										{/if}
									</div>
								</td>
								<td data-label="Value" class="num">
									<ValueDisplay value={topRecord.value} type={topRecord.value_type} showBadge={true} />
								</td>
								<td data-label="Team" class="desktop-only">
									{#if topRecord.holders.length > 0}
										<div class="cluster cluster-sm">
											{#each topRecord.holders as holder (holder.rsn)}
												<UserChip rsn={holder.rsn} display={holder.display} points={holder.points} />
											{/each}
										</div>
									{:else if topRecord.value != null}
										<span class="badge">Solo</span>
									{:else}
										<span class="muted small">—</span>
									{/if}
								</td>
								<td data-label="Date" class="muted small desktop-only" style="padding-right: var(--space-4);">{formatDate(topRecord.date)}</td>
							</tr>
							{#if isExpanded}
								{#each records.slice(1) as subRecord (subRecord.record_id)}
									{@const subParts = formatBossNameParts(subRecord.display_name, subRecord.category)}
									<tr class="" style="background: color-mix(in srgb, var(--color-surface-2) 40%, transparent);">
										<td data-label="Boss" style="padding-left: var(--space-4);">
											<div class="cluster cluster-sm">
												<span class="muted mobile-hidden" style="padding-left: 1rem;">↳</span>
												<span class="num mono {rankClass(subRecord.position)}">#{subRecord.position}</span>
												<a href={guildPath(guildId, `/bosses/${encodeURIComponent(subRecord.boss_name)}`)} class="desktop-hidden" style="font-weight: 500; color: var(--color-text-muted);">
													{#if subParts.categoryText}
														<span class="muted">{subParts.categoryText}</span>
													{/if}
													<span style="color: var(--color-text);">{subParts.bossText}</span>
												</a>
											</div>
										</td>
										<td data-label="Value" class="num">
											<ValueDisplay value={subRecord.value} type={subRecord.value_type} showBadge={true} />
										</td>
										<td data-label="Team" class="desktop-only">
											{#if subRecord.holders.length > 0}
												<div class="cluster cluster-sm">
													{#each subRecord.holders as holder (holder.rsn)}
														<UserChip rsn={holder.rsn} display={holder.display} points={holder.points} />
													{/each}
												</div>
											{:else if subRecord.value != null}
												<span class="badge">Solo</span>
											{:else}
												<span class="muted small">—</span>
											{/if}
										</td>
										<td data-label="Date" class="muted small desktop-only" style="padding-right: var(--space-4);">{formatDate(subRecord.date)}</td>
									</tr>
								{/each}
							{/if}
						{/each}
				</tbody>
			{/each}
		</table>
	</div>
</section>
