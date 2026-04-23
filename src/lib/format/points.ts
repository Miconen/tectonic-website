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
