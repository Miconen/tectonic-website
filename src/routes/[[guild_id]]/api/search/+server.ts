import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLeaderboard, resolveGuild } from '$lib/api/client';

export const GET: RequestHandler = async ({ params, fetch, url, setHeaders }) => {
	const guildId = resolveGuild(params);
	const query = url.searchParams.get('q')?.trim().toLowerCase() || '';

	if (!query) {
		return json({ results: [] });
	}

	const leaderboard = await getLeaderboard(fetch, guildId);

	const matches = [];
	for (let i = 0; i < leaderboard.length; i++) {
		const u = leaderboard[i];
		if (u.rsns?.some((r) => r.rsn.toLowerCase().includes(query))) {
			matches.push({
				rank: i + 1,
				primaryRsn: u.rsns[0]?.rsn ?? u.user_id,
				points: u.points
			});
			if (matches.length >= 6) break; // Limit to top 6 results
		}
	}

	// Cache the search results briefly to avoid spamming the backend
	setHeaders({ 'cache-control': 'public, max-age=15' });

	return json({ results: matches });
};
