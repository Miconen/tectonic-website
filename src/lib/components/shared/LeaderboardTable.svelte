<script lang="ts">
	import { guildPath } from '$lib/api/paths';
	import { formatPoints, rankClass, getIconForPoints } from '$lib/format/points';
	import type { LeaderboardUser } from '$lib/api/types';

	interface Props {
		users: LeaderboardUser[];
		guildId: string | undefined;
		/**
		 * Offset added to index to calculate rank.
		 * Useful if passing a sliced array manually (though usually handled by pagination).
		 */
		rankOffset?: number;
		/**
		 * If true, shows "RSNs" column (desktop only).
		 */
		showAlts?: boolean;
		/**
		 * If true, disables client-side pagination (useful for Top 5 widgets).
		 */
		disablePagination?: boolean;
		/**
		 * Number of rows per page when pagination is enabled.
		 */
		pageSize?: number;
	}

	let { 
		users, 
		guildId, 
		rankOffset = 0, 
		showAlts = false, 
		disablePagination = false, 
		pageSize = 50 
	}: Props = $props();

	let currentPage = $state(1);

	// Reset to page 1 if the input user array changes (e.g., during filtering)
	$effect(() => {
		if (users) {
			currentPage = 1;
		}
	});

	let totalPages = $derived(disablePagination ? 1 : Math.ceil(users.length / pageSize));
	
	let visibleUsers = $derived.by(() => {
		if (disablePagination) return users;
		const start = (currentPage - 1) * pageSize;
		return users.slice(start, start + pageSize);
	});

	function prevPage() {
		if (currentPage > 1) currentPage--;
	}

	function nextPage() {
		if (currentPage < totalPages) currentPage++;
	}
</script>

<div class="table-wrapper">
	<table class="table table-collapse-mobile" style="font-size: 0.9375rem; margin-bottom: 0;">
		<thead>
			<tr>
				<th style="width: 4rem; padding-left: var(--space-4);">Rank</th>
				<th>Player</th>
				{#if showAlts}
					<th class="desktop-only">RSNs</th>
				{/if}
				<th class="num" style="padding-right: var(--space-4);">Points</th>
			</tr>
		</thead>
		<tbody>
			{#each visibleUsers as u, i (u.user_id)}
				{@const rank = disablePagination ? (i + 1 + rankOffset) : ((currentPage - 1) * pageSize + i + 1 + rankOffset)}
				{@const primary = u.rsns?.[0]?.rsn ?? u.user_id}
				{@const display = u.discordName ?? primary}
				{@const allRsns = (u.rsns ?? []).map(r => r.rsn)}
				{@const iconName = getIconForPoints(u.points)}
				<tr class={rank <= 3 ? `row-rank-${rank}` : ''}>
					<td data-label="Rank" class={rankClass(rank)} style="padding-left: var(--space-4);">#{rank}</td>
					<td data-label="Player">
						<a href={guildPath(guildId, `/users/${encodeURIComponent(primary)}`)} style="font-weight: 600; display: inline-flex; align-items: center; gap: var(--space-1);">
							{#if iconName}
								<img src="/icons/Clan_icon_-_{iconName}.png" alt="" style="width: 13px; height: 13px; image-rendering: pixelated;" />
							{/if}
							{display}
						</a>
					</td>
					{#if showAlts}
						<td data-label="RSNs" class="muted small desktop-only">
							{allRsns.join(', ') || '—'}
						</td>
					{/if}
					<td data-label="Points" class="num mono" style="padding-right: var(--space-4); font-weight: 500;">
						{formatPoints(u.points)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if !disablePagination && totalPages > 1}
		<div class="pagination">
			<button class="chip" onclick={prevPage} disabled={currentPage === 1}>
				Previous
			</button>
			<span class="muted small mono">
				Page {currentPage} of {totalPages}
			</span>
			<button class="chip" onclick={nextPage} disabled={currentPage === totalPages}>
				Next
			</button>
		</div>
	{/if}
</div>

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--color-border);
		background: color-mix(in srgb, var(--color-surface) 50%, transparent);
	}
	.pagination button {
		cursor: pointer;
		border: none;
	}
	.pagination button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
