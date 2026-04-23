<script lang="ts">
	interface Props {
		label: string;
		value: string | number;
		color?: string;
	}
	let { label, value, color }: Props = $props();
</script>

<div class="stat-item">
	<span class="tiny muted">{label}</span>
	<span class="stat-val" style="color: {color ?? 'var(--color-text)'};">{value}</span>
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