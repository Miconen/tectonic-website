import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getBosses,
	getGuildTimes,
	getUsersById,
	resolveGuild
} from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const bossName = decodeURIComponent(params.boss);

	const [bosses, guild] = await Promise.all([
		getBosses(fetch),
		getGuildTimes(fetch, guildId)
	]);

	const boss = bosses.find((b) => b.name === bossName);
	if (!boss) throw error(404, `Unknown boss "${bossName}"`);

	const pb = (guild.pbs ?? []).find((p) => p.boss_name === bossName) ?? null;

	let holders: string[] = [];
	if (pb) {
		const holderIds = (guild.teammates ?? [])
			.filter((t) => t.run_id === pb.run_id)
			.map((t) => t.user_id);
		const users = holderIds.length
			? await getUsersById(fetch, guildId, holderIds)
			: [];
		const rsnByUser = new Map<string, string>();
		for (const u of users) rsnByUser.set(u.user_id, u.rsns?.[0]?.rsn ?? u.user_id);
		holders = holderIds.map((id) => rsnByUser.get(id) ?? id);
	}

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { boss, pb, holders };
};
