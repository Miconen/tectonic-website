import type { PageServerLoad } from './$types';
import {
	getBosses,
	getGuildTimes,
	getUsersById,
	resolveGuild
} from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);

	const [bosses, guild] = await Promise.all([
		getBosses(fetch),
		getGuildTimes(fetch, guildId)
	]);

	const bossByName = new Map(bosses.map((b) => [b.name, b]));

	const userIds = new Set<string>();
	for (const t of guild.teammates ?? []) userIds.add(t.user_id);
	const users = userIds.size ? await getUsersById(fetch, guildId, [...userIds]) : [];
	const rsnByUser = new Map<string, string>();
	for (const u of users) rsnByUser.set(u.user_id, u.rsns?.[0]?.rsn ?? u.user_id);

	const rows = (guild.pbs ?? []).map((pb) => {
		const b = bossByName.get(pb.boss_name);
		const holders = (guild.teammates ?? [])
			.filter((t) => t.run_id === pb.run_id)
			.map((t) => rsnByUser.get(t.user_id) ?? t.user_id);
		return {
			run_id: pb.run_id,
			boss_name: pb.boss_name,
			display_name: b?.display_name ?? pb.boss_name,
			category: b?.category ?? '—',
			solo: b?.solo ?? false,
			time: pb.time,
			date: pb.date,
			holders
		};
	});

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { rows };
};
