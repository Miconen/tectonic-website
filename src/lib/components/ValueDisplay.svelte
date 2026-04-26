<script lang="ts">
	import { formatTicks, TICK_SECONDS } from '$lib/format/time';
	import { formatPoints } from '$lib/format/points';

	interface Props {
		value: number | null | undefined;
		type: string; // 'time', 'depth', etc.
		showBadge?: boolean;
	}
	let { value, type, showBadge = false }: Props = $props();

	let isTime = $derived(type.toLowerCase() === 'time');
	
	let label = $derived(
		value == null ? '—' : 
		isTime ? formatTicks(value) : 
		formatPoints(value)
	);
	
	let tooltip = $derived(
		value != null && isTime 
			? `${(value * TICK_SECONDS).toFixed(2)}s (${value} ticks)` 
			: ''
	);
</script>

{#if showBadge && type && !isTime && value != null}
	<div class="cluster cluster-sm" style="justify-content: flex-end; flex-wrap: nowrap;">
		<span class="mono" title={value?.toString()}>{label}</span>
		<span class="badge" style="font-size: 0.625rem; padding: 0 0.375rem; letter-spacing: 0.05em; text-transform: uppercase;">
			{type}
		</span>
	</div>
{:else}
	{#if isTime}
		<time class="mono" title={tooltip}>{label}</time>
	{:else}
		<span class="mono" title={value?.toString()}>{label}</span>
	{/if}
{/if}
