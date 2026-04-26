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
	const bossByName = new Map(bosses.map((b) => [b.name, b]));

	const userIds = new Set<string>();
	for (const t of guild.teammates ?? []) userIds.add(t.user_id);
	const users = userIds.size ? await getUsersById(fetch, guildId, [...userIds]) : [];
	const userMap = new Map<string, { rsn: string; points: number }>();
	for (const u of users) userMap.set(u.user_id, { rsn: u.rsns?.[0]?.rsn ?? u.user_id, points: u.points });

	// Map PBs
	const recordsByBoss = new Map<string, (typeof guild.records)[number][]>();
	for (const pb of guild.records ?? []) {
		const arr = recordsByBoss.get(pb.boss_name) ?? [];
		arr.push(pb);
		recordsByBoss.set(pb.boss_name, arr);
	}

	// Build rows (one for every boss, even if no PB)
	const rows: any[] = [];
	for (const b of bosses) {
		const bossRecords = recordsByBoss.get(b.name) || [];
		const cat = categoryMap.get(b.category);

		if (bossRecords.length === 0) {
			rows.push({
				record_id: -1 * Math.random(),
				boss_name: b.name,
				display_name: b.display_name,
				category: b.category,
				category_order: cat?.order ?? 999,
				category_thumbnail: cat?.thumbnail ?? null,
				solo: b.solo,
				value_type: b.value_type,
				value: null,
				position: 0,
				date: null,
				holders: []
			});
		} else {
			for (const pb of bossRecords) {
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
					record_id: pb.record_id,
					boss_name: b.name,
					display_name: b.display_name,
					category: b.category,
					category_order: cat?.order ?? 999,
					category_thumbnail: cat?.thumbnail ?? null,
					solo: b.solo,
					value_type: b.value_type,
					value: pb.value,
					position: pb.position,
					date: pb.date,
					holders
				});
			}
		}
	}

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { rows };
};
