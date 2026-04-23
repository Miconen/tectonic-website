import type { PageServerLoad } from './$types';
import { getLeaderboard, resolveGuild } from '$lib/api/client';
import { getDiscordNamesMap } from '$lib/server/discord';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	
	const [leaderboard, discordNames] = await Promise.all([
		getLeaderboard(fetch, guildId),
		getDiscordNamesMap(guildId)
	]);

	const enrichedLeaderboard = leaderboard.map((u) => ({
		...u,
		discordName: discordNames.get(u.user_id) || null
	}));

	setHeaders({ 'cache-control': 'public, max-age=30' });
	return { leaderboard: enrichedLeaderboard };
};
