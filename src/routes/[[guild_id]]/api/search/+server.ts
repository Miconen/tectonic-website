import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLeaderboard, resolveGuild } from '$lib/api/client';
import { getDiscordNamesMap } from '$lib/server/discord';

// This endpoint now returns the entire roster map to the client to enable 0ms local search filtering.
export const GET: RequestHandler = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);

	const [leaderboard, discordNames] = await Promise.all([
		getLeaderboard(fetch, guildId),
		getDiscordNamesMap(guildId)
	]);

	const matches = [];
	for (let i = 0; i < leaderboard.length; i++) {
		const u = leaderboard[i];
		const primaryRsn = u.rsns?.[0]?.rsn ?? u.user_id;
		const discordName = discordNames.get(u.user_id);
		
		// Map all available aliases for this user into a single searchable string block
		const searchTerms = [discordName, ...(u.rsns?.map(r => r.rsn) ?? [])]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();

		matches.push({
			rank: i + 1,
			primaryRsn: discordName ?? primaryRsn,
			urlRsn: primaryRsn, 
			points: u.points,
			searchTerms
		});
	}

	// Cache the entire roster for 3 minutes to avoid backend spam
	setHeaders({ 'cache-control': 'public, max-age=180' });

	return json({ results: matches });
};
