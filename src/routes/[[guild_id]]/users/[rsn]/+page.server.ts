import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUsersByRsn, getUsersById, getGuild, getBosses, getGuildCombatAchievements, resolveGuild } from '$lib/api/client';
import { getDiscordNamesMap } from '$lib/server/discord';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const rsn = decodeURIComponent(params.rsn);

	const [users, guild, bosses, guildCAs, discordNames] = await Promise.all([
		getUsersByRsn(fetch, guildId, [rsn]),
		getGuild(fetch, guildId),
		getBosses(fetch),
		getGuildCombatAchievements(fetch, guildId),
		getDiscordNamesMap(guildId)
	]);

	const user = users[0];
	if (!user) {
		throw error(404, `No user with RSN "${rsn}" in this guild`);
	}

	const bossByName = new Map(bosses.map((b) => [b.name, b]));

	// Attempt to get Discord name from cache
	const discordName = discordNames.get(user.user_id) || null;

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
	const userMap = new Map<string, { rsn: string; points: number }>();
	for (const u of teammates) {
		userMap.set(u.user_id, { rsn: u.rsns?.[0]?.rsn ?? u.user_id, points: u.points });
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
				holders: (guild.teammates ?? [])
					.filter((t) => t.run_id === pb.run_id && t.user_id !== user.user_id)
					.map((t) => {
						const u = userMap.get(t.user_id);
						return {
							rsn: u ? u.rsn : t.user_id,
							display: discordNames.get(t.user_id) || undefined,
							points: u?.points
						};
					})
			};
		});

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return {
		user,
		pbs,
		discordName,
		primaryRsn: user.rsns?.find((r) => r.rsn.toLowerCase() === rsn.toLowerCase())?.rsn ?? user.rsns?.[0]?.rsn ?? rsn,
		guildCAs
	};
};
