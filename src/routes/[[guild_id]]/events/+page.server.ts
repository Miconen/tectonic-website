import type { PageServerLoad } from './$types';
import { getEvents, resolveGuild } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const guildId = resolveGuild(params);
	const events = await getEvents(fetch, guildId);

	// Sort events by position_cutoff descending as a basic proxy for size/importance, 
	// or name, depending on your preferred default. Here we just return them.
	
	setHeaders({ 'cache-control': 'public, max-age=60' });

	return { events };
};
