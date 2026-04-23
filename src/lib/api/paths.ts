/**
 * Browser-safe URL helpers. Must not import any server-only modules.
 */

/**
 * Build a route-relative URL that preserves the guild segment if present.
 * Use from .svelte components with `$page.params.guild_id`.
 */
export function guildPath(
	guildIdFromParams: string | undefined,
	path: string
): string {
	const suffix = path.startsWith('/') ? path : `/${path}`;
	if (guildIdFromParams) {
		return `/${encodeURIComponent(guildIdFromParams)}${suffix}`;
	}
	return suffix;
}
