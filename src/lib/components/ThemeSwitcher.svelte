<script lang="ts">
	import { onMount } from 'svelte';

	type Theme = 'system' | 'dark' | 'light' | 'parchment';

	let theme: Theme = $state('system');

	onMount(() => {
		const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system';
		theme = stored;
		apply(stored);
	});

	function apply(t: Theme) {
		if (t === 'system') {
			delete document.documentElement.dataset.theme;
		} else {
			document.documentElement.dataset.theme = t;
		}
	}

	function onChange(e: Event) {
		const v = (e.target as HTMLSelectElement).value as Theme;
		theme = v;
		localStorage.setItem('theme', v);
		apply(v);
	}
</script>

<label class="theme-switcher" aria-label="Theme">
	<select value={theme} onchange={onChange}>
		<option value="system">System</option>
		<option value="dark">Dark</option>
		<option value="light">Light</option>
		<option value="parchment">Parchment</option>
	</select>
</label>
