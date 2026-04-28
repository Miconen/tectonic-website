<script lang="ts">
	import '@fontsource-variable/inter';
	import '@fontsource-variable/jetbrains-mono';
	import '../app.css';
	import { onNavigate } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import TopProgress from '$lib/components/TopProgress.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}
	let { children }: Props = $props();

	let showWipBanner = $state(false);

	onMount(() => {
		if (!sessionStorage.getItem('hideWipBanner')) {
			showWipBanner = true;
		}
	});

	function closeBanner() {
		showWipBanner = false;
		sessionStorage.setItem('hideWipBanner', 'true');
	}

	// Progressive enhancement: view transitions API
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			try {
				const transition = document.startViewTransition(async () => {
					resolve();
					await navigation.complete;
				});
				transition.finished.catch(() => {});
				transition.ready.catch(() => {});
			} catch (e) {
				resolve();
			}
		});
	});
</script>

<TopProgress />

{#if showWipBanner}
	<div class="wip-banner">
		<div class="wip-banner-inner">
			<span><strong>Work in progress</strong> &nbsp;—&nbsp; Features may break and the domain will change in the future.</span>
			<button class="wip-close" aria-label="Close" onclick={closeBanner}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
			</button>
		</div>
	</div>
{/if}

<Header />
<!-- Dim content while navigating -->
<main class="container" class:navigating={!!$navigating}>
	{@render children?.()}
</main>
<Footer />

<style>
	main {
		transition: opacity 120ms ease;
	}
	main.navigating {
		opacity: 0.55;
		pointer-events: none;
	}
</style>
