import type { PageServerLoad } from './$types';
import {
	getGuildTimes,
	getLeaderboard,
	getUsersById,
	resolveGuild
} from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);

	const [leaderboard, guild] = await Promise.all([
		getLeaderboard(fetch, guildId),
		getGuildTimes(fetch, guildId)
	]);

	const top5 = leaderboard.slice(0, 5);

	// Build RSN lookup for any user that appears as a PB holder or top-5
	const pbs = (guild.pbs ?? [])
		.slice()
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 5);

	const teammateIds = new Set<string>();
	for (const pb of pbs) {
		for (const t of guild.teammates ?? []) {
			if (t.run_id === pb.run_id) teammateIds.add(t.user_id);
		}
	}

	// Resolve user ids -> primary RSN for chip rendering
	const users = teammateIds.size > 0 ? await getUsersById(fetch, guildId, [...teammateIds]) : [];
	const rsnByUser = new Map<string, string>();
	for (const u of users) {
		rsnByUser.set(u.user_id, u.rsns?.[0]?.rsn ?? u.user_id);
	}

	const latestPbs = pbs.map((pb) => ({
		...pb,
		holders: (guild.teammates ?? [])
			.filter((t) => t.run_id === pb.run_id)
			.map((t) => rsnByUser.get(t.user_id) ?? t.user_id)
	}));

	setHeaders({ 'cache-control': 'public, max-age=30' });

	return {
		top5,
		latestPbs,
		totalMembers: leaderboard.length
	};
};
