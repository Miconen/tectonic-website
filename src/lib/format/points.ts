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

