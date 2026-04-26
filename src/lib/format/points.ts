import type { GuildRankResponse } from '$lib/api/types';

export function formatPoints(n: number | null | undefined): string {
	if (n == null || !Number.isFinite(n)) return '0';
	return new Intl.NumberFormat('en-US').format(n);
}

export function rankClass(rank: number | null | undefined): string {
	if (rank === 1) return 'rank rank-1';
	if (rank === 2) return 'rank rank-2';
	if (rank === 3) return 'rank rank-3';
	return 'rank';
}

export function getTierForPoints(points: number | null | undefined, ranks: GuildRankResponse[]): GuildRankResponse | null {
	if (points == null || !Number.isFinite(points) || !ranks || ranks.length === 0) return null;
	const sorted = [...ranks].sort((a, b) => b.min_points - a.min_points);
	return sorted.find(r => points >= r.min_points) || null;
}

/**
 * Transforms "red_topaz" -> "Red Topaz"
 */
export function formatRankText(name: string | null | undefined): string {
	if (!name) return '';
	return name
		.replace(/[^a-zA-Z0-9]/g, ' ')
		.split(' ')
		.filter(Boolean)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

/**
 * Converts various rank icon formats into a usable image URL.
 * Handles HTTP URLs, Discord Emoji strings (<:name:id>), and local filename fallbacks.
 */
export function getRankIconUrl(icon: string | null | undefined): string | null {
	if (!icon) return null;

	// If it's already a direct URL
	if (icon.startsWith('http://') || icon.startsWith('https://')) {
		return icon;
	}

	// If it's a Discord custom emoji string e.g., <:Jade:1234567890>
	const emojiMatch = icon.match(/<a?:.+?:(\d+)>/);
	if (emojiMatch) {
		const isAnimated = icon.startsWith('<a:');
		return `https://cdn.discordapp.com/emojis/${emojiMatch[1]}.${isAnimated ? 'gif' : 'png'}`;
	}

	// Fallback to local /icons/ folder mapping (e.g., "red_topaz" -> "/icons/Clan_icon_-_Red_Topaz.png")
	const formatted = icon
		.split(/[-_ ]/)
		.filter(Boolean)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('_');
		
	return `/icons/Clan_icon_-_${formatted}.png`;
}

