<script lang="ts">
	import { page } from '$app/stores';
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import { guildPath } from '$lib/api/paths';

	// Reactive guild segment (if any) for nav links
	let guildId = $derived($page.params.guild_id as string | undefined);

	const links = [
		{ href: '', label: 'Home' },
		{ href: '/leaderboard', label: 'Leaderboard' },
		{ href: '/bosses', label: 'Bosses' },
		{ href: '/pbs', label: 'PBs' }
	];

	function isActive(href: string): boolean {
		const current = $page.url.pathname;
		const target = guildPath(guildId, href || '/');
		if (target === '/' || target === `/${guildId}`) {
			return current === target;
		}
		return current === target || current.startsWith(target + '/');
	}
</script>

<header class="site-header">
	<div class="site-header-inner">
		<a class="brand" href={guildPath(guildId, '/')}>Tectonic</a>
		<nav>
			{#each links as link (link.href)}
				<a
					href={guildPath(guildId, link.href || '/')}
					class:active={isActive(link.href)}
				>
					{link.label}
				</a>
			{/each}
		</nav>
		<ThemeSwitcher />
	</div>
</header>
