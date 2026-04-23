import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLeaderboard, resolveGuild } from '$lib/api/client';
import { getDiscordNamesMap } from '$lib/server/discord';

export const GET: RequestHandler = async ({ params, fetch, url, setHeaders }) => {
	const guildId = resolveGuild(params);
	const query = url.searchParams.get('q')?.trim().toLowerCase() || '';

	if (!query) {
		return json({ results: [] });
	}

	const [leaderboard, discordNames] = await Promise.all([
		getLeaderboard(fetch, guildId),
		getDiscordNamesMap(guildId)
	]);

	const matches = [];
	for (let i = 0; i < leaderboard.length; i++) {
		const u = leaderboard[i];
		const primaryRsn = u.rsns?.[0]?.rsn ?? u.user_id;
		const discordName = discordNames.get(u.user_id);
		
		// Search both RSNs and Discord name
		const matchRsn = u.rsns?.some((r) => r.rsn.toLowerCase().includes(query));
		const matchDiscord = discordName?.toLowerCase().includes(query);

		if (matchRsn || matchDiscord) {
			matches.push({
				rank: i + 1,
				primaryRsn: discordName ?? primaryRsn,
				urlRsn: primaryRsn, // Need original RSN for the URL
				points: u.points
			});
			if (matches.length >= 6) break; // Limit to top 6 results
		}
	}

	// Cache the search results briefly to avoid spamming the backend
	setHeaders({ 'cache-control': 'public, max-age=15' });

	return json({ results: matches });
};
