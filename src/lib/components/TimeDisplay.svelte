<script lang="ts">
	import { formatTicks, TICK_SECONDS } from '$lib/format/time';

	interface Props {
		ticks: number | null | undefined;
	}
	let { ticks }: Props = $props();

	let label = $derived(formatTicks(ticks));
	let secondsTitle = $derived(
		ticks != null ? `${(ticks * TICK_SECONDS).toFixed(2)}s (${ticks} ticks)` : ''
	);
</script>

<time class="mono" title={secondsTitle}>{label}</time>
