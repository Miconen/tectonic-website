<script lang="ts">
	import { guildPath } from '$lib/api/paths';
	import { formatBossName } from '$lib/format/boss';
	import { formatDate } from '$lib/format/time';
	import ValueDisplay from '$lib/components/ValueDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';
	import { rankClass } from '$lib/format/points';

	export interface PbRow {
		record_id: number;
		boss_name: string;
		display_name: string;
		category: string;
		solo: boolean;
		value: number | null;
		value_type: string;
		position: number;
		date: string | null;
		holders: { rsn: string; display?: string; points?: number }[];
	}

	interface Props {
		rows: PbRow[];
		guildId: string | undefined;
		/** Render boss name using Category + Display Name */
		contextualBossName?: boolean;
		/** Show date column/info */
		showDate?: boolean;
		/** Show team holders */
		showHolders?: boolean;
		/** Show record position/rank */
		showPosition?: boolean;
		/** How wrapping should behave for the boss column */
		bossWrap?: 'single-line' | 'multi-line';
	}

	let {
		rows,
		guildId,
		contextualBossName = true,
		showDate = true,
		showHolders = true,
		showPosition = false,
		bossWrap = 'single-line'
	}: Props = $props();
</script>

<div class="table-wrapper">
	<table class="table table-collapse-mobile" style="margin-bottom: 0;">
		<thead>
			<tr>
				{#if showPosition}
					<th style="width: 4rem; padding-left: var(--space-4);">Rank</th>
					<th style="padding-left: var(--space-2);">Boss</th>
				{:else}
					<th style="padding-left: var(--space-4);">Boss</th>
				{/if}
				<th class="num" style={!showDate && !showHolders ? 'padding-right: var(--space-4);' : ''}>Value</th>
				{#if showHolders}
					<th class="desktop-only" style={!showDate ? 'padding-right: var(--space-4);' : ''}>Team</th>
				{/if}
				{#if showDate}
					<th class="desktop-only" style="padding-right: var(--space-4);">Date</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each rows as pb (pb.record_id)}
				<tr class={showPosition && pb.position <= 3 ? `row-rank-${pb.position}` : ''}>
					{#if showPosition}
						<td data-label="Rank" class="num mono {pb.position <= 3 ? rankClass(pb.position) : 'muted'}" style="padding-left: var(--space-4); text-align: left;">
							#{pb.position}
						</td>
					{/if}
					<td data-label="Boss" style={showPosition ? 'padding-left: var(--space-2);' : 'padding-left: var(--space-4);'}>
						<div class="stack-sm" style="margin-top: 0;">
							<a href={guildPath(guildId, `/bosses/${encodeURIComponent(pb.boss_name)}`)} style="font-weight: 500;">
								{contextualBossName ? formatBossName(pb.display_name, pb.category) : pb.display_name}
							</a>
							<!-- On mobile, Date and Holders stack below the boss if multi-line is enabled -->
							{#if bossWrap === 'multi-line'}
								<div class="desktop-only" style="display: none;">
									<!-- Hidden on desktop, visible on mobile collapse -->
								</div>
								<div class="mobile-only-stack stack-sm" style="margin-top: 4px;">
									{#if showHolders}
										{#if pb.holders.length > 0}
											<div class="cluster cluster-sm">
												{#each pb.holders as holder (holder.rsn)}
													<UserChip rsn={holder.rsn} display={holder.display} points={holder.points} />
												{/each}
											</div>
										{:else}
											<span class="badge">Solo</span>
										{/if}
									{/if}
									{#if showDate && pb.date}
										<span class="muted tiny">{formatDate(pb.date)}</span>
									{/if}
								</div>
							{/if}
						</div>
					</td>
					
					<td data-label="Value" class="num nowrap" style="vertical-align: top; padding-top: calc(var(--space-2) + 2px); {!showDate && !showHolders ? 'padding-right: var(--space-4);' : ''}">
						<ValueDisplay value={pb.value} type={pb.value_type} />
					</td>
					
					{#if showHolders}
						<td data-label="Team" class="desktop-only" style="vertical-align: top; padding-top: var(--space-2); {!showDate ? 'padding-right: var(--space-4);' : ''}">
							{#if pb.holders.length > 0}
								<div class="cluster cluster-sm">
									{#each pb.holders as holder (holder.rsn)}
										<UserChip rsn={holder.rsn} display={holder.display} points={holder.points} />
									{/each}
								</div>
							{:else if pb.value != null}
								<span class="badge">Solo</span>
							{:else}
								<span class="muted small">—</span>
							{/if}
						</td>
					{/if}
					
					{#if showDate}
						<td data-label="Date" class="muted small desktop-only nowrap" style="vertical-align: top; padding-top: calc(var(--space-2) + 2px); padding-right: var(--space-4);">
							{formatDate(pb.date)}
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.mobile-only-stack {
		display: none;
	}
	@media (max-width: 639px) {
		.mobile-only-stack {
			display: flex;
			flex-direction: column;
		}
	}
</style>