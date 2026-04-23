import type { PageServerLoad } from './$types';
import { getEvents, getDetailedEvent, getUsersById, resolveGuild } from '$lib/api/client';
import { getDiscordNamesMap } from '$lib/server/discord';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const [rawEvents, discordNames] = await Promise.all([
		getEvents(fetch, guildId),
		getDiscordNamesMap(guildId)
	]);

	// Extract years via Regex to sort them. Fallback to 0 if no year found.
	const extractYear = (name: string) => {
		const match = name.match(/\b(20\d{2})\b/);
		return match ? parseInt(match[1], 10) : 0;
	};

	// Parallel fetch details for all events to find the winner
	const detailedPromises = rawEvents.map(e => getDetailedEvent(fetch, guildId, e.wom_id).catch(() => null));
	const details = await Promise.all(detailedPromises);

	// Collect all winner user_ids so we can fetch their points/rsns in one go
	const winnerIds = new Set<string>();
	details.forEach(d => {
		if (d && d.participations) {
			const winner = d.participations.find(p => p.placement === 1);
			if (winner) winnerIds.add(winner.user_id);
		}
	});

	const winnerUsers = winnerIds.size > 0 ? await getUsersById(fetch, guildId, [...winnerIds]) : [];
	const userMap = new Map<string, { rsn: string; points: number }>();
	for (const u of winnerUsers) {
		userMap.set(u.user_id, { rsn: u.rsns?.[0]?.rsn ?? u.user_id, points: u.points });
	}

	const events = rawEvents.map((e, index) => {
		const d = details[index];
		let winnerData = null;

		if (d && d.participations) {
			const winner = d.participations.find(p => p.placement === 1);
			if (winner) {
				const u = userMap.get(winner.user_id);
				winnerData = {
					rsn: u?.rsn ?? winner.user_id,
					display: discordNames.get(winner.user_id),
					points: u?.points
				};
			}
		}

		return {
			...e,
			year: extractYear(e.name),
			winner: winnerData
		};
	}).sort((a, b) => b.year - a.year);
	
	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { events };
};
