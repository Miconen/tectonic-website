<script lang="ts">
	import { page } from '$app/stores';
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import { guildPath } from '$lib/api/paths';

	let guildId = $derived($page.params.guild_id as string | undefined);

	const links = [
		{ href: '/leaderboard', label: 'Leaderboard' },
		{ href: '/pbs', label: 'Bosses & PBs' }
	];

	function isActive(href: string): boolean {
		const current = $page.url.pathname;
		const target = guildPath(guildId, href);
		return current === target || current.startsWith(target + '/');
	}
</script>

<header class="site-header">
	<div class="site-header-inner">
		<a class="brand" href={guildPath(guildId, '/')}>Tectonic</a>
		<nav>
			{#each links as link (link.href)}
				<a
					href={guildPath(guildId, link.href)}
					class:active={isActive(link.href)}
				>
					{link.label}
				</a>
			{/each}
		</nav>
		<ThemeSwitcher />
	</div>
</header>
