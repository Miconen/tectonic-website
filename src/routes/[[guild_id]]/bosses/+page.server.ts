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

	// Map boss_name -> pb
	const pbByBoss = new Map<string, (typeof guild.pbs)[number]>();
	for (const pb of guild.pbs ?? []) pbByBoss.set(pb.boss_name, pb);

	// Gather teammate user_ids for all PBs
	const userIds = new Set<string>();
	for (const t of guild.teammates ?? []) userIds.add(t.user_id);
	const users = userIds.size ? await getUsersById(fetch, guildId, [...userIds]) : [];
	const rsnByUser = new Map<string, string>();
	for (const u of users) rsnByUser.set(u.user_id, u.rsns?.[0]?.rsn ?? u.user_id);

	const bossesByCategory = new Map<
		string,
		Array<{
			boss: (typeof bosses)[number];
			pbTime: number | null;
			holders: string[];
		}>
	>();
	for (const b of bosses) {
		const pb = pbByBoss.get(b.name) ?? null;
		const holders = pb
			? (guild.teammates ?? [])
					.filter((t) => t.run_id === pb.run_id)
					.map((t) => rsnByUser.get(t.user_id) ?? t.user_id)
			: [];
		const entry = { boss: b, pbTime: pb?.time ?? null, holders };
		const arr = bossesByCategory.get(b.category) ?? [];
		arr.push(entry);
		bossesByCategory.set(b.category, arr);
	}

	const sortedCategories = categories
		.slice()
		.sort((a, b) => a.order - b.order)
		.map((c) => ({
			...c,
			bosses: (bossesByCategory.get(c.name) ?? []).sort((a, b) =>
				a.boss.display_name.localeCompare(b.boss.display_name)
			)
		}))
		.filter((c) => c.bosses.length > 0);

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { categories: sortedCategories };
};
