<script lang="ts">
	import { formatTicks, TICK_SECONDS } from '$lib/format/time';
	import { formatPoints } from '$lib/format/points';

	interface Props {
		value: number | null | undefined;
		type: string; // 'time', 'depth', etc.
	}
	let { value, type }: Props = $props();

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

{#if isTime}
	<time class="mono" title={tooltip}>{label}</time>
{:else}
	<span class="mono" title={value?.toString()}>{label}</span>
{/if}
