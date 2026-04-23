import type { PageServerLoad } from './$types';
import { getLeaderboard, resolveGuild } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const leaderboard = await getLeaderboard(fetch, guildId);
	setHeaders({ 'cache-control': 'public, max-age=30' });
	return { leaderboard };
};
