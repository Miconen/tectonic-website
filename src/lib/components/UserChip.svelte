<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';
	import { getIconForPoints } from '$lib/format/points';

	interface Props {
		rsn: string;
		display?: string;
		points?: number;
	}
	let { rsn, display, points }: Props = $props();

	let guildId = $derived($page.params.guild_id as string | undefined);
	let iconName = $derived(points != null ? getIconForPoints(points) : null);
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
