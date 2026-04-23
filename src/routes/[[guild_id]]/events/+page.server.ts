import type { PageServerLoad } from './$types';
import { getEvents, resolveGuild } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const rawEvents = await getEvents(fetch, guildId);

	// Extract years via Regex to sort them. Fallback to 0 if no year found.
	const extractYear = (name: string) => {
		const match = name.match(/\b(20\d{2})\b/);
		return match ? parseInt(match[1], 10) : 0;
	};

	const events = rawEvents.map((e) => ({
		...e,
		year: extractYear(e.name)
	})).sort((a, b) => b.year - a.year);
	
	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { events };
};
