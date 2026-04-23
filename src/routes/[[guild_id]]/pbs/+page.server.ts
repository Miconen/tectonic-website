import type { PageServerLoad } from './$types';
import {
	getBosses,
	getCategories,
	getGuildTimes,
	getUsersById,
	resolveGuild
} from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);

	const [bosses, categories, guild] = await Promise.all([
		getBosses(fetch),
		getCategories(fetch),
		getGuildTimes(fetch, guildId)
	]);

	const categoryMap = new Map(categories.map((c) => [c.name, c]));
	const bossByName = new Map(bosses.map((b) => [b.name, b]));

	const userIds = new Set<string>();
	for (const t of guild.teammates ?? []) userIds.add(t.user_id);
	const users = userIds.size ? await getUsersById(fetch, guildId, [...userIds]) : [];
	const rsnByUser = new Map<string, string>();
	for (const u of users) rsnByUser.set(u.user_id, u.rsns?.[0]?.rsn ?? u.user_id);

	// Map PBs
	const pbByBoss = new Map<string, (typeof guild.pbs)[number]>();
	for (const pb of guild.pbs ?? []) pbByBoss.set(pb.boss_name, pb);

	// Build rows (one for every boss, even if no PB)
	const rows = bosses.map((b) => {
		const pb = pbByBoss.get(b.name);
		const holders = pb
			? (guild.teammates ?? [])
					.filter((t) => t.run_id === pb.run_id)
					.map((t) => rsnByUser.get(t.user_id) ?? t.user_id)
			: [];
		const cat = categoryMap.get(b.category);
		return {
			boss_name: b.name,
			display_name: b.display_name,
			category: b.category,
			category_order: cat?.order ?? 999,
			category_thumbnail: cat?.thumbnail ?? null,
			solo: b.solo,
			time: pb?.time ?? null,
			date: pb?.date ?? null,
			holders
		};
	});

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { rows };
};
