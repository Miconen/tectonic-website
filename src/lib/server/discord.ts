import { env } from '$env/dynamic/private';

// Simple in-memory cache to avoid hitting Discord rate limits for frequent profile visits.
// A Map of userId -> discordName
const discordNameCache = new Map<string, { name: string; expiry: number }>();

export async function getDiscordName(guildId: string, userId: string, fetchFn: typeof fetch = fetch): Promise<string | null> {
	const token = env.DISCORD_BOT_TOKEN;
	if (!token) return null;

	const now = Date.now();
	const cached = discordNameCache.get(userId);
	if (cached && cached.expiry > now) {
		return cached.name;
	}

	try {
		// Fetch member from the specific guild to get their server nickname
		const res = await fetchFn(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
			headers: {
				Authorization: `Bot ${token}`
			}
		});

		if (res.ok) {
			const member = await res.json();
			// Prefer server nickname (nick), fallback to global_name, fallback to username
			const name = member.nick || member.user.global_name || member.user.username;
			
			// Cache for 1 hour (3600000 ms)
			discordNameCache.set(userId, { name, expiry: now + 3600000 });
			return name;
		}

		// If member not found in guild, fallback to global user fetch
		if (res.status === 404) {
			const userRes = await fetchFn(`https://discord.com/api/v10/users/${userId}`, {
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
			}
		}

		return null;
	} catch (e) {
		console.error(`Failed to fetch Discord name for ${userId}:`, e);
		return null;
	}
}
