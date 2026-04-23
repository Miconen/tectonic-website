import { env } from '$env/dynamic/private';

// Simple in-memory cache to avoid hitting Discord rate limits for frequent profile visits.
// A Map of userId -> discordName
const discordNameCache = new Map<string, { name: string; expiry: number }>();

export async function getDiscordName(guildId: string, userId: string): Promise<string | null> {
	const token = env.DISCORD_BOT_TOKEN;
	if (!token) return null;

	const now = Date.now();
	const cached = discordNameCache.get(userId);
	if (cached && cached.expiry > now) {
		return cached.name;
	}

	try {
		// Use global fetch to avoid SvelteKit SSR tracing quirks on external APIs
		const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
			headers: {
				Authorization: `Bot ${token}`
			}
		});

		if (res.ok) {
			const member = await res.json();
			// Prefer server nickname (nick), fallback to global_name, fallback to username
			const name = member.nick || member.user?.global_name || member.user?.username;
			
			// Cache for 1 hour (3600000 ms)
			discordNameCache.set(userId, { name, expiry: now + 3600000 });
			return name;
		}

		if (res.status === 401 || res.status === 403) {
			console.warn(`[Discord API] Fetching guild member failed with ${res.status}. Is the bot in the server and does it have the 'Server Members Intent' enabled?`);
		}

		// Fallback to global user fetch if member not found (or on intent error)
		const userRes = await fetch(`https://discord.com/api/v10/users/${userId}`, {
			headers: {
				Authorization: `Bot ${token}`
			}
		});
		
		if (userRes.ok) {
			const user = await userRes.json();
			const name = user.global_name || user.username;
			// Cache for 1 hour
			discordNameCache.set(userId, { name, expiry: now + 3600000 });
			return name;
		} else {
			if (userRes.status === 401) {
				console.warn(`[Discord API] Fetching user failed with 401. Check if DISCORD_BOT_TOKEN is correct.`);
			}
		}

		return null;
	} catch (e) {
		console.error(`[Discord API] Failed to fetch Discord name for ${userId}:`, e);
		return null;
	}
}
