<script lang="ts">
	import { formatRankIcon } from '$lib/format/points';

	interface Props {
		label: string;
		value?: string | number;
		color?: string;
		icon?: string | null;
		children?: import('svelte').Snippet;
	}
	let { label, value, color, icon, children }: Props = $props();
</script>

<div class="stat-item">
	<span class="tiny muted">{label}</span>
	<div class="stat-val cluster cluster-sm" style="color: {color ?? 'var(--color-text)'};">
		{#if icon}
			<img src="/icons/Clan_icon_-_{formatRankIcon(icon)}.png" alt="" style="width: 18px; height: 18px; image-rendering: pixelated;" />
		{/if}
		{#if value !== undefined}
			{value}
		{/if}
		{@render children?.()}
	</div>
</div>

<style>
	.stat-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.stat-val {
		font-family: var(--font-mono);
		font-size: 1.125rem;
		font-weight: 600;
	}
</style>