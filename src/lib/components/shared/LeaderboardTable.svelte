<script lang="ts">
	import { guildPath } from '$lib/api/paths';
	import { formatPoints, rankClass, getIconForPoints } from '$lib/format/points';
	import type { LeaderboardUser } from '$lib/api/types';

	interface Props {
		users: LeaderboardUser[];
		guildId: string | undefined;
		/**
		 * Offset added to index to calculate rank.
		 * Useful if passing a sliced array (though usually we pass the full list or start at 0).
		 */
		rankOffset?: number;
		/**
		 * If true, shows "Known aliases" column (desktop only).
		 */
		showAlts?: boolean;
	}

	let { users, guildId, rankOffset = 0, showAlts = false }: Props = $props();
</script>

<div class="table-wrapper">
	<table class="table table-collapse-mobile" style="font-size: 0.9375rem; margin-bottom: 0;">
		<thead>
			<tr>
				<th style="width: 4rem; padding-left: var(--space-4);">Rank</th>
				<th>Player</th>
				{#if showAlts}
					<th class="desktop-only">Known aliases</th>
				{/if}
				<th class="num" style="padding-right: var(--space-4);">Points</th>
			</tr>
		</thead>
		<tbody>
			{#each users as u, i (u.user_id)}
				{@const rank = i + 1 + rankOffset}
				{@const primary = u.rsns?.[0]?.rsn ?? u.user_id}
				{@const display = u.discordName ?? primary}
				{@const alts = (u.rsns ?? []).map(r => r.rsn).filter(r => r !== display)}
				{@const iconName = getIconForPoints(u.points)}
				<tr class={rank <= 3 ? `row-rank-${rank}` : ''}>
					<td class={rankClass(rank)} style="padding-left: var(--space-4);">#{rank}</td>
					<td>
						<a href={guildPath(guildId, `/users/${encodeURIComponent(primary)}`)} style="font-weight: 600; display: inline-flex; align-items: center; gap: var(--space-1);">
							{#if iconName}
								<img src="/icons/Clan_icon_-_{iconName}.png" alt="" style="width: 13px; height: 13px; image-rendering: pixelated;" />
							{/if}
							{display}
						</a>
					</td>
					{#if showAlts}
						<td class="muted small desktop-only">
							{alts.join(', ') || '—'}
						</td>
					{/if}
					<td class="num mono" style="padding-right: var(--space-4); font-weight: 500;">
						{formatPoints(u.points)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
