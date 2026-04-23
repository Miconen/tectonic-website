/**
 * Server-only Tectonic API client.
 *
 * Every function takes a `fetch` (the SvelteKit `event.fetch` or equivalent)
 * so calls can be traced and cached by the framework.
 *
 * Do not import this file into any .svelte component directly — it should
 * only be used from +page.server.ts / +layout.server.ts.
 */
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type {
	Achievement,
	Boss,
	Category,
	DetailedGuild,
	DetailedUser,
	LeaderboardUser,
	RawText,
	ErrorModel
} from './types';
import { text } from './unwrap';

type Fetch = typeof fetch;

function baseUrl(): string {
	const u = env.API_BASE_URL;
	if (!u) {
		throw error(500, 'API_BASE_URL is not configured');
	}
	return u.replace(/\/$/, '');
}

async function call<T>(fetch: Fetch, path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${baseUrl()}${path}`, {
		...init,
		headers: {
			accept: 'application/json',
			...(init?.headers ?? {})
		}
	});

	if (!res.ok) {
		let detail: string | undefined;
		try {
			const body = (await res.json()) as ErrorModel;
			detail = body.detail ?? body.title;
		} catch {
			/* ignore */
		}
		throw error(res.status, detail ?? `Upstream API returned ${res.status}`);
	}

	// 204 No Content
	if (res.status === 204) return undefined as unknown as T;

	return (await res.json()) as T;
}

// ---------- guild-scoped ----------

export function getLeaderboard(fetch: Fetch, guildId: string) {
	return call<LeaderboardUser[] | null>(
		fetch,
		`/api/v1/guilds/${encodeURIComponent(guildId)}/leaderboard`
	).then((r) => r ?? []);
}

export function getGuildTimes(fetch: Fetch, guildId: string) {
	return call<DetailedGuild>(
		fetch,
		`/api/v1/guilds/${encodeURIComponent(guildId)}/times`
	);
}

export async function getUsersByRsn(
	fetch: Fetch,
	guildId: string,
	rsns: string[]
): Promise<DetailedUser[]> {
	if (rsns.length === 0) return [];
	const joined = rsns.map(encodeURIComponent).join(',');
	const r = await call<DetailedUser[] | null>(
		fetch,
		`/api/v1/guilds/${encodeURIComponent(guildId)}/users/rsn/${joined}`
	);
	return r ?? [];
}

export async function getUsersById(
	fetch: Fetch,
	guildId: string,
	ids: string[]
): Promise<DetailedUser[]> {
	if (ids.length === 0) return [];
	const joined = ids.map(encodeURIComponent).join(',');
	const r = await call<DetailedUser[] | null>(
		fetch,
		`/api/v1/guilds/${encodeURIComponent(guildId)}/users/${joined}`
	);
	return r ?? [];
}

// ---------- global ----------

export function getBosses(fetch: Fetch) {
	return call<Boss[] | null>(fetch, `/api/v1/bosses`).then((r) => r ?? []);
}

interface RawCategory {
	name: string;
	order: number;
	thumbnail: RawText;
}

export async function getCategories(fetch: Fetch): Promise<Category[]> {
	const r = await call<RawCategory[] | null>(fetch, `/api/v1/categories`);
	return (r ?? []).map((c) => ({
		name: c.name,
		order: c.order,
		thumbnail: text(c.thumbnail)
	}));
}

export function getAchievements(fetch: Fetch) {
	return call<Achievement[] | null>(fetch, `/api/v1/achievements`).then(
		(r) => r ?? []
	);
}

// ---------- guild id resolution ----------

/**
 * Resolve the effective guild id from route params with env fallback.
 * - If `params.guild_id` is present, use it.
 * - Else fall back to DEFAULT_GUILD_ID.
 * - If neither is available, throw 404.
 */
export function resolveGuild(params: { guild_id?: string }): string {
	const fromUrl = params.guild_id;
	const fromEnv = env.DEFAULT_GUILD_ID;
	const resolved = fromUrl || fromEnv;
	if (!resolved) {
		throw error(
			404,
			'No guild id: include a /{guild_id}/ segment or set DEFAULT_GUILD_ID.'
		);
	}
	return resolved;
}

// guildPath lives in ./paths.ts (browser-safe). Re-export not done to keep
// server-only imports clearly separated.
