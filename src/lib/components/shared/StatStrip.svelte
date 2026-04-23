<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}
	let { children }: Props = $props();
</script>

<div class="stat-strip">
	{@render children?.()}
</div>

<style>
	.stat-strip {
		display: flex;
		gap: var(--space-5);
		padding: var(--space-4) 0;
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		overflow-x: auto;
		white-space: nowrap;
	}
</style>