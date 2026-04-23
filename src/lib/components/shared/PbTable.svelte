<script lang="ts">
	import { guildPath } from '$lib/api/paths';
	import { formatBossName } from '$lib/format/boss';
	import { formatDate } from '$lib/format/time';
	import TimeDisplay from '$lib/components/TimeDisplay.svelte';
	import UserChip from '$lib/components/UserChip.svelte';

	export interface PbRow {
		run_id: number;
		boss_name: string;
		display_name: string;
		category: string;
		solo: boolean;
		time: number | null;
		date: string | null;
		holders: string[];
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
		/** How wrapping should behave for the boss column */
		bossWrap?: 'single-line' | 'multi-line';
	}

	let {
		rows,
		guildId,
		contextualBossName = true,
		showDate = true,
		showHolders = true,
		bossWrap = 'single-line'
	}: Props = $props();
</script>

<div class="table-wrapper">
	<table class="table table-collapse-mobile" style="margin-bottom: 0;">
		<thead>
			<tr>
				<th style="padding-left: var(--space-4);">Boss</th>
				<th class="num">Time</th>
				{#if showHolders}
					<th class="desktop-only">Team</th>
				{/if}
				{#if showDate}
					<th class="desktop-only" style="padding-right: var(--space-4);">Date</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each rows as pb (pb.run_id)}
				<tr>
					<td style="padding-left: var(--space-4);">
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
												<span class="muted tiny">w/</span>
												{#each pb.holders as rsn (rsn)}
													<UserChip {rsn} />
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
					
					<td class="num nowrap" style="vertical-align: top; padding-top: calc(var(--space-2) + 2px);">
						<TimeDisplay ticks={pb.time} />
					</td>
					
					{#if showHolders}
						<td class="desktop-only" style="vertical-align: top; padding-top: var(--space-2);">
							{#if pb.holders.length > 0}
								<div class="cluster cluster-sm">
									<span class="muted tiny">w/</span>
									{#each pb.holders as rsn (rsn)}
										<UserChip {rsn} />
									{/each}
								</div>
							{:else if pb.time != null}
								<span class="badge">Solo</span>
							{:else}
								<span class="muted small">—</span>
							{/if}
						</td>
					{/if}
					
					{#if showDate}
						<td class="muted small desktop-only nowrap" style="vertical-align: top; padding-top: calc(var(--space-2) + 2px); padding-right: var(--space-4);">
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