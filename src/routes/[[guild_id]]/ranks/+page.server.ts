import type { PageServerLoad } from './$types';
import { getGuild, getGuildRanks, resolveGuild } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);

	// Fetch detailed guild to get user_count and time_count
	// Fetch ranks array directly from the /ranks endpoint
	const [guild, ranks] = await Promise.all([
		getGuild(fetch, guildId, true),
		getGuildRanks(fetch, guildId)
	]);

	// Sort ranks descending by required points
	const sortedRanks = ranks.sort((a, b) => b.min_points - a.min_points);

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return {
		guild,
		ranks: sortedRanks
	};
};
