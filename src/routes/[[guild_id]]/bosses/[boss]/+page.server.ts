import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getBosses,
	getGuild,
	getUsersById,
	resolveGuild
} from '$lib/api/client';
import { getDiscordNamesMap } from '$lib/server/discord';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const bossName = decodeURIComponent(params.boss);

	const [bosses, guild, discordNames] = await Promise.all([
		getBosses(fetch),
		getGuild(fetch, guildId),
		getDiscordNamesMap(guildId)
	]);

	const boss = bosses.find((b) => b.name === bossName);
	if (!boss) throw error(404, `Unknown boss "${bossName}"`);

	const records = (guild.records ?? [])
		.filter((p) => p.boss_name === bossName)
		.sort((a, b) => a.position - b.position);

	const holderIds = new Set<string>();
	records.forEach((r) => {
		(guild.teammates ?? []).forEach((t) => {
			if (t.record_id === r.record_id) holderIds.add(t.user_id);
		});
	});

	const users = holderIds.size
		? await getUsersById(fetch, guildId, Array.from(holderIds))
		: [];
	const userMap = new Map<string, { rsn: string; points: number }>();
	for (const u of users) userMap.set(u.user_id, { rsn: u.rsns?.[0]?.rsn ?? u.user_id, points: u.points });

	const enrichedRecords = records.map((r) => {
		const team = (guild.teammates ?? [])
			.filter((t) => t.record_id === r.record_id)
			.map((t) => {
				const u = userMap.get(t.user_id);
				return {
					rsn: u ? u.rsn : t.user_id,
					display: discordNames.get(t.user_id) || undefined,
					points: u?.points
				};
			});
		return { ...r, team };
	});

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { boss, records: enrichedRecords };
};
