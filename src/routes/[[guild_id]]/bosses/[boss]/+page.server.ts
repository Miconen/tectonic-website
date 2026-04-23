import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getBosses,
	getGuildTimes,
	getUsersById,
	resolveGuild
} from '$lib/api/client';
import { getDiscordNamesMap } from '$lib/server/discord';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const bossName = decodeURIComponent(params.boss);

	const [bosses, guild, discordNames] = await Promise.all([
		getBosses(fetch),
		getGuildTimes(fetch, guildId),
		getDiscordNamesMap(guildId)
	]);

	const boss = bosses.find((b) => b.name === bossName);
	if (!boss) throw error(404, `Unknown boss "${bossName}"`);

	const pb = (guild.pbs ?? []).find((p) => p.boss_name === bossName) ?? null;

	let holders: { rsn: string; display?: string; points?: number }[] = [];
	if (pb) {
		const holderIds = (guild.teammates ?? [])
			.filter((t) => t.run_id === pb.run_id)
			.map((t) => t.user_id);
		const users = holderIds.length
			? await getUsersById(fetch, guildId, holderIds)
			: [];
		const userMap = new Map<string, { rsn: string; points: number }>();
		for (const u of users) userMap.set(u.user_id, { rsn: u.rsns?.[0]?.rsn ?? u.user_id, points: u.points });
		holders = holderIds.map((id) => {
			const u = userMap.get(id);
			return {
				rsn: u ? u.rsn : id,
				display: discordNames.get(id) || undefined,
				points: u?.points
			};
		});
	}

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { boss, pb, holders };
};
