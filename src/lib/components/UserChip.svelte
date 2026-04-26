<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { getTierForPoints } from '$lib/format/points';
	import type { GuildRankResponse } from '$lib/api/types';

	interface Props {
		rsn: string;
		display?: string;
		points?: number;
	}
	let { rsn, display, points }: Props = $props();

	let guildId = $derived($page.params.guild_id as string | undefined);
	let ranks = $derived(($page.data.ranks as GuildRankResponse[]) || []);
	let iconName = $derived(getTierForPoints(points, ranks)?.icon);
</script>

<a class="chip" href={guildPath(guildId, `/users/${encodeURIComponent(rsn)}`)}>
	{#if iconName}
		<img src="/icons/Clan_icon_-_{iconName}.png" alt="" class="user-icon" />
	{/if}
	{display ?? rsn}
</a>

<style>
	.user-icon {
		width: 13px;
		height: 13px;
		image-rendering: pixelated;
		object-fit: contain;
		margin-right: 2px;
	}
</style>
