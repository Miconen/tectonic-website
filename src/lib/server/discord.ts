import { env } from '$env/dynamic/private';

// A single cached map of the entire guild roster.
// userId -> { name, global_name, username }
let guildRosterCache: Map<string, string> | null = null;
let rosterCacheExpiry = 0;
// We'll also keep a small cache for fallback individual fetches if needed
const fallbackCache = new Map<string, { name: string; expiry: number }>();

async function fetchFullRoster(guildId: string, token: string): Promise<Map<string, string>> {
	const roster = new Map<string, string>();
	let after = '0';
	
	try {
		while (true) {
			const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000&after=${after}`, {
				headers: {
					Authorization: `Bot ${token}`
				}
			});

			if (!res.ok) {
				console.warn(`[Discord API] Bulk fetch failed with ${res.status}.`);
				break;
			}

			const members = await res.json();
			if (members.length === 0) break;

			for (const member of members) {
				const name = member.nick || member.user?.global_name || member.user?.username;
				if (name) {
					roster.set(member.user.id, name);
				}
			}
			
			if (members.length < 1000) break;
			after = members[members.length - 1].user.id;
		}
	} catch (e) {
		console.error(`[Discord API] Error during bulk roster fetch:`, e);
	}
	
	return roster;
}

export async function getDiscordName(guildId: string, userId: string): Promise<string | null> {
	const token = env.DISCORD_BOT_TOKEN;
	if (!token) return null;

	const now = Date.now();

	// If roster cache is missing or expired, fetch in background and serve stale if available
	if (!guildRosterCache || now > rosterCacheExpiry) {
		rosterCacheExpiry = now + 15 * 60 * 1000; // 15 minutes
		// Non-blocking fetch
		fetchFullRoster(guildId, token).then(r => {
			if (r.size > 0) guildRosterCache = r;
		});
	}

	// Try roster cache first
	if (guildRosterCache && guildRosterCache.has(userId)) {
		return guildRosterCache.get(userId) || null;
	}

	// Try fallback individual cache
	const cached = fallbackCache.get(userId);
	if (cached && cached.expiry > now) {
		return cached.name;
	}

	// Fallback individual fetch if not in bulk cache (maybe they left the server)
	try {
		const userRes = await fetch(`https://discord.com/api/v10/users/${userId}`, {
			headers: {
				Authorization: `Bot ${token}`
			}
		});
		
		if (userRes.ok) {
			const user = await userRes.json();
			const name = user.global_name || user.username;
			fallbackCache.set(userId, { name, expiry: now + 3600000 }); // 1 hour
			return name;
		}

		return null;
	} catch (e) {
		return null;
	}
}

/**
 * Returns the entire bulk-fetched roster map to be used by server endpoints.
 * Very fast since it almost always serves from memory.
 */
export async function getDiscordNamesMap(guildId: string): Promise<Map<string, string>> {
	const token = env.DISCORD_BOT_TOKEN;
	if (!token) return new Map();

	const now = Date.now();
	
	if (!guildRosterCache || now > rosterCacheExpiry) {
		// If we don't have it at all, await it. If we have it but it's expired, await it to ensure fresh data.
		rosterCacheExpiry = now + 15 * 60 * 1000;
		const r = await fetchFullRoster(guildId, token);
		if (r.size > 0) guildRosterCache = r;
	}
	
	return guildRosterCache || new Map();
}
