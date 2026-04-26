import type { PageServerLoad } from './$types';
import {
	getBosses,
	getCategories,
	getGuild,
	getUsersById,
	resolveGuild
} from '$lib/api/client';
import { getDiscordNamesMap } from '$lib/server/discord';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);

	const [bosses, categories, guild, discordNames] = await Promise.all([
		getBosses(fetch),
		getCategories(fetch),
		getGuild(fetch, guildId),
		getDiscordNamesMap(guildId)
	]);

	const categoryMap = new Map(categories.map((c) => [c.name, c]));

	const userIds = new Set<string>();
	for (const t of guild.teammates ?? []) userIds.add(t.user_id);
	const users = userIds.size ? await getUsersById(fetch, guildId, [...userIds]) : [];
	const userMap = new Map<string, { rsn: string; points: number }>();
	for (const u of users) userMap.set(u.user_id, { rsn: u.rsns?.[0]?.rsn ?? u.user_id, points: u.points });

	// Map PBs - we only care about the #1 record for this page now
	const topRecordByBoss = new Map<string, (typeof guild.records)[number]>();
	for (const pb of guild.records ?? []) {
		if (pb.position === 1) {
			topRecordByBoss.set(pb.boss_name, pb);
		}
	}

	// Build rows (one for every boss, even if no PB)
	const rows: any[] = [];
	for (const b of bosses) {
		const pb = topRecordByBoss.get(b.name);
		const cat = categoryMap.get(b.category);

		if (!pb) {
			rows.push({
				boss_name: b.name,
				display_name: b.display_name,
				category: b.category,
				category_order: cat?.order ?? 999,
				category_thumbnail: cat?.thumbnail ?? null,
				solo: b.solo,
				value_type: b.value_type,
				value: null,
				date: null,
				holders: []
			});
		} else {
			const holders = (guild.teammates ?? [])
				.filter((t) => t.record_id === pb.record_id)
				.map((t) => {
					const u = userMap.get(t.user_id);
					return {
						rsn: u ? u.rsn : t.user_id,
						display: discordNames.get(t.user_id),
						points: u?.points
					};
				});
			rows.push({
				boss_name: b.name,
				display_name: b.display_name,
				category: b.category,
				category_order: cat?.order ?? 999,
				category_thumbnail: cat?.thumbnail ?? null,
				solo: b.solo,
				value_type: b.value_type,
				value: pb.value,
				date: pb.date,
				holders
			});
		}
	}

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { rows };
};
