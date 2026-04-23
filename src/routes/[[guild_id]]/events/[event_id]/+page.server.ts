import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getEvents, getDetailedEvent, getUsersById, resolveGuild } from '$lib/api/client';
import { getDiscordNamesMap } from '$lib/server/discord';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const eventId = decodeURIComponent(params.event_id);

	const [events, detailed, discordNames] = await Promise.all([
		getEvents(fetch, guildId),
		getDetailedEvent(fetch, guildId, eventId),
		getDiscordNamesMap(guildId)
	]);

	const eventMeta = events.find(e => e.wom_id === eventId);
	if (!eventMeta || !detailed) {
		throw error(404, 'Event not found');
	}

	// Resolve user IDs to RSNs and Points
	const userIds = new Set((detailed.participations ?? []).map((p) => p.user_id));
	const users = userIds.size > 0 ? await getUsersById(fetch, guildId, [...userIds]) : [];
	
	const userMap = new Map<string, { rsn: string; points: number }>();
	for (const u of users) {
		userMap.set(u.user_id, { rsn: u.rsns?.[0]?.rsn ?? u.user_id, points: u.points });
	}

	const participations = (detailed.participations ?? [])
		.sort((a, b) => a.placement - b.placement)
		.map(p => {
			const u = userMap.get(p.user_id);
			return {
				placement: p.placement,
				user_id: p.user_id,
				rsn: u?.rsn ?? p.user_id,
				display: discordNames.get(p.user_id) || undefined,
				points: u?.points ?? 0
			};
		});

	setHeaders({ 'cache-control': 'public, max-age=60' });

	return {
		event: eventMeta,
		participations
	};
};
