import type { PageServerLoad } from './$types';
import {
	getGuildTimes,
	getLeaderboard,
	getUsersById,
	getBosses,
	resolveGuild
} from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);

	const [leaderboard, guild, bosses] = await Promise.all([
		getLeaderboard(fetch, guildId),
		getGuildTimes(fetch, guildId),
		getBosses(fetch)
	]);

	const bossByName = new Map(bosses.map((b) => [b.name, b]));

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
	const userMap = new Map<string, { rsn: string; points: number }>();
	for (const u of users) {
		userMap.set(u.user_id, { rsn: u.rsns?.[0]?.rsn ?? u.user_id, points: u.points });
	}

	const latestPbs = pbs.map((pb) => {
		const b = bossByName.get(pb.boss_name);
		return {
			...pb,
			display_name: b?.display_name ?? pb.boss_name,
			category: b?.category ?? '',
			solo: b?.solo ?? true,
			holders: (guild.teammates ?? [])
				.filter((t) => t.run_id === pb.run_id)
				.map((t) => {
					const u = userMap.get(t.user_id);
					return u ? { rsn: u.rsn, points: u.points } : { rsn: t.user_id };
				})
		};
	});

	setHeaders({ 'cache-control': 'public, max-age=30' });

	return {
		top5,
		latestPbs,
		totalMembers: leaderboard.length
	};
};
