import type { LayoutServerLoad } from './$types';
import { resolveGuild, getGuildRanks } from '$lib/api/client';

/**
 * Resolves the effective guild id once per request and exposes it to the
 * page tree. Throws 404 if no guild id is present in params or env.
 */
export const load: LayoutServerLoad = async ({ params, fetch }) => {
	const guildId = resolveGuild(params);
	const ranks = await getGuildRanks(fetch, guildId);
	
	return { guildId, ranks };
};
