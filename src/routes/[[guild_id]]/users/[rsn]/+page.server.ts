import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUsersByRsn, getUsersById, getGuildTimes, getBosses, getGuildCombatAchievements, resolveGuild } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const rsn = decodeURIComponent(params.rsn);

	const [users, guild, bosses, guildCAs] = await Promise.all([
		getUsersByRsn(fetch, guildId, [rsn]),
		getGuildTimes(fetch, guildId),
		getBosses(fetch),
		getGuildCombatAchievements(fetch, guildId)
	]);

	const user = users[0];
	if (!user) {
		throw error(404, `No user with RSN "${rsn}" in this guild`);
	}

	const bossByName = new Map(bosses.map((b) => [b.name, b]));

	// Determine PBs this user holds/contributed to by joining with guild times
	const userRuns = new Set(
		(guild.teammates ?? [])
			.filter((t) => t.user_id === user.user_id)
			.map((t) => t.run_id)
	);
	const heldPbs = (guild.pbs ?? []).filter((pb) => userRuns.has(pb.run_id));

	// Resolve teammates on each held PB to RSN chips
	const teammateIds = new Set<string>();
	for (const pb of heldPbs) {
		for (const t of guild.teammates ?? []) {
			if (t.run_id === pb.run_id && t.user_id !== user.user_id) {
				teammateIds.add(t.user_id);
			}
		}
	}
	const teammates = teammateIds.size
		? await getUsersById(fetch, guildId, [...teammateIds])
		: [];
	const rsnByUser = new Map<string, string>();
	for (const u of teammates) {
		rsnByUser.set(u.user_id, u.rsns?.[0]?.rsn ?? u.user_id);
	}

	const pbs = heldPbs
		.slice()
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.map((pb) => {
			const b = bossByName.get(pb.boss_name);
			return {
				...pb,
				display_name: b?.display_name ?? pb.boss_name,
				category: b?.category ?? '',
				solo: b?.solo ?? true,
				teammates: (guild.teammates ?? [])
					.filter((t) => t.run_id === pb.run_id && t.user_id !== user.user_id)
					.map((t) => rsnByUser.get(t.user_id) ?? t.user_id)
			};
		});

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return {
		user,
		pbs,
		primaryRsn: user.rsns?.[0]?.rsn ?? rsn,
		maxCombatAchievements: guildCAs.length
	};
};
